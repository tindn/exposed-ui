import type { ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import type {
  RecentProject,
  Inventory,
  DashboardState,
} from '../shared/types.js';
import { errorMessage } from '../shared/types.js';
import { createServer } from 'node:http';
import { readFile, stat, writeFile, rename } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { loadProject } from './projects.js';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, extname, sep } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { Processes } from './processes.js';
import { discover, emulator } from './devices.js';

if (process.argv.includes('--help')) {
  console.log(
    'exposed [project-directory] [--no-open]\nLaunch the dashboard, then paste an Expo project path.',
  );
  process.exit(0);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const recentFile = resolve(root, '.recent-projects.json');
let current: Awaited<ReturnType<typeof loadProject>> | null = null;
let recentProjects: RecentProject[] = [],
  selecting = false;
try {
  const saved = JSON.parse(await readFile(recentFile, 'utf8'));
  if (Array.isArray(saved))
    recentProjects = saved
      .filter((p) => typeof p.path === 'string' && typeof p.name === 'string')
      .slice(0, 8);
} catch {}
const initialPath = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (initialPath) {
  try {
    current = await loadProject(resolve(initialPath));
  } catch (error) {
    console.error(errorMessage(error));
    process.exit(1);
  }
}
if (!existsSync(resolve(root, 'dist/index.html'))) {
  console.error(
    'Build the dashboard first: npm run build in the exposed-ui directory.',
  );
  process.exit(1);
}
const processes = new Processes();
const token = randomBytes(32).toString('hex');
const clients = new Set<ServerResponse>();
let inventory: Inventory = { devices: [], warnings: [] };
let scanning = false;
const snapshot = (): DashboardState => ({
  project: current && {
    name: current.name,
    path: current.path,
    expo: current.expo,
  },
  recentProjects,
  ...inventory,
  scanning,
  jobs: processes.snapshot(),
});
const broadcast = () => {
  const data = `data: ${JSON.stringify(snapshot())}\n\n`;
  for (const client of clients) client.write(data);
};
processes.on('change', broadcast);
async function refresh() {
  if (scanning) return;
  scanning = true;
  broadcast();
  try {
    inventory = await discover();
  } finally {
    scanning = false;
    broadcast();
  }
}
let origin: string;
const server = createServer(async (req, res) => {
  const send = (status: number, data: unknown) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };
  try {
    if (req.headers.host !== new URL(origin).host)
      return send(403, { error: 'Invalid host' });
    const url = new URL(req.url || '/', origin);
    if (url.pathname.startsWith('/api/')) {
      if (req.headers.origin && req.headers.origin !== origin)
        return send(403, { error: 'Invalid origin' });
      if (url.searchParams.get('token') !== token)
        return send(401, { error: 'Invalid session' });
      if (req.method === 'GET' && url.pathname === '/api/events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        clients.add(res);
        res.write(`data: ${JSON.stringify(snapshot())}\n\n`);
        req.on('close', () => clients.delete(res));
        return;
      }
      if (req.method !== 'POST') return send(405, { error: 'Use POST' });
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 8192)
          return send(413, { error: 'Request too large' });
      }
      const input: Record<string, unknown> = JSON.parse(body || '{}');
      if (!input || typeof input !== 'object' || Array.isArray(input))
        return send(400, { error: 'Expected an object' });
      if (url.pathname === '/api/project') {
        if (selecting || processes.children.size)
          return send(409, {
            error: 'Stop running commands before switching projects.',
          });
        selecting = true;
        try {
          const next = await loadProject(input.path);
          const recent = [
            { name: next.name, path: next.path },
            ...recentProjects.filter((p) => p.path !== next.path),
          ].slice(0, 8);
          await writeFile(recentFile + '.tmp', JSON.stringify(recent), {
            mode: 0o600,
          });
          await rename(recentFile + '.tmp', recentFile);
          current = next;
          recentProjects = recent;
          processes.jobs = [];
          broadcast();
          return send(200, { ok: true });
        } finally {
          selecting = false;
        }
      }
      if (url.pathname === '/api/refresh') {
        void refresh();
        return send(200, { ok: true });
      }
      if (url.pathname === '/api/stop') {
        if (typeof input.id !== 'string')
          return send(400, { error: 'Expected a job id' });
        processes.stop(input.id);
        return send(200, { ok: true });
      }
      if (url.pathname !== '/api/run')
        return send(404, { error: 'Unknown action' });
      if (selecting)
        return send(409, {
          error: 'Project is switching. Try again in a moment.',
        });
      if (!current && input.action !== 'boot')
        return send(400, { error: 'Open an Expo project first.' });
      const project = current?.path || root;
      let id;
      if (input.action === 'metro') {
        id = processes.start(
          'Metro',
          process.execPath,
          [
            current!.cli,
            'start',
            '--port',
            '8081',
            ...(input.clear ? ['--clear'] : []),
          ],
          project,
          'metro',
        );
      } else {
        const device = inventory.devices.find(
          (d) => d.id === input.deviceId && d.type === input.deviceType,
        );
        if (!device)
          return send(400, { error: 'Refresh and select an available device' });
        if (input.action === 'boot' && device.type === 'simulator')
          id = processes.start(
            `Boot ${device.name}`,
            'xcrun',
            ['simctl', 'boot', device.id],
            project,
            `boot:${device.id}`,
          );
        else if (input.action === 'boot' && device.type === 'avd')
          id = processes.start(
            `Emulator ${device.name}`,
            emulator,
            ['-avd', device.id],
            project,
            `boot:${device.id}`,
          );
        else if (input.action === 'build' && device.type !== 'avd') {
          if (device.platform === 'android' && device.state !== 'device')
            throw new Error('Authorize and connect this Android device first');
          id = processes.start(
            `Build & run · ${device.name}`,
            process.execPath,
            [
              current!.cli,
              `run:${device.platform}`,
              '--device',
              device.id,
              '--no-bundler',
            ],
            project,
            'build',
          );
        } else return send(400, { error: 'Unsupported device action' });
      }
      return send(200, { id });
    }
    if (req.method !== 'GET') return send(405, { error: 'Use GET' });
    const dist = resolve(root, 'dist');
    const path = resolve(
      dist,
      '.' +
        decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname),
    );
    if (!path.startsWith(dist + sep))
      return send(403, { error: 'Invalid path' });
    if (!(await stat(path)).isFile()) return send(404, { error: 'Not found' });
    res.writeHead(200, {
      'Content-Type':
        (
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.ico': 'image/x-icon',
          } as Record<string, string>
        )[extname(path)] || 'application/octet-stream',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    });
    createReadStream(path).pipe(res);
  } catch (error) {
    send(
      error instanceof Error && 'code' in error && error.code === 'ENOENT'
        ? 404
        : 400,
      { error: errorMessage(error) },
    );
  }
});
server.listen(0, '127.0.0.1', () => {
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const url = `${origin}/#${token}`;
  console.log(
    `Exposed UI · ${current?.path || 'Choose a project in your browser'}\n${url}`,
  );
  if (!process.argv.includes('--no-open')) {
    const child = spawn(
      process.platform === 'darwin' ? 'open' : 'xdg-open',
      [url],
      { stdio: 'ignore' },
    );
    child.on('error', () => console.log('Open the URL above in your browser.'));
  }
  void refresh();
});
const heartbeat = setInterval(() => {
  for (const client of clients) client.write(': keepalive\n\n');
}, 15000);
function shutdown() {
  clearInterval(heartbeat);
  for (const id of processes.children.keys()) processes.stop(id);
  for (const client of clients) client.end();
  server.close();
  setTimeout(() => process.exit(0), 4500);
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
