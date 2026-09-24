import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readScripts, scriptCommand } from './scripts.js';

test('detects workspace manager, refreshes scripts, and runs in the app directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'exposed-scripts-'));
  const app = join(root, 'apps', 'demo');
  try {
    await mkdir(app, { recursive: true });
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ packageManager: 'pnpm@10.0.0' }),
    );
    await writeFile(
      join(app, 'package.json'),
      JSON.stringify({
        scripts: { check: 'node -e "console.log(process.cwd())"' },
      }),
    );
    const workspace = await readScripts(app);
    assert.equal(workspace.packageManager, 'pnpm');
    assert.deepEqual(scriptCommand(workspace, 'check'), {
      command: 'pnpm',
      args: ['run', 'check'],
    });
    assert.throws(
      () => scriptCommand(workspace, 'toString'),
      /Choose a script/,
    );
    assert.throws(
      () => scriptCommand(workspace, 'check; echo injected'),
      /Choose a script/,
    );
    await writeFile(
      join(app, 'package.json'),
      JSON.stringify({
        packageManager: 'npm@11.0.0',
        scripts: { verify: workspace.scripts.check },
      }),
    );
    const refreshed = await readScripts(app);
    assert.equal(refreshed.packageManager, 'npm');
    assert.throws(() => scriptCommand(refreshed, 'check'), /Choose a script/);
    const { command, args } = scriptCommand(refreshed, 'verify');
    const { stdout } = await promisify(execFile)(command, args, { cwd: app });
    assert.ok(stdout.includes(app));
    await writeFile(join(app, 'package.json'), '{}');
    assert.deepEqual((await readScripts(app)).scripts, {});
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('forwards parsed arguments through npm and pnpm', async () => {
  const { parseArguments } = await import('../shared/arguments.js');
  const extra = parseArguments('--clear --name "two words" \'\'');
  assert.deepEqual(extra, ['--clear', '--name', 'two words', '']);
  assert.throws(() => parseArguments('"unfinished'), /Close the quote/);
  const root = await mkdtemp(join(tmpdir(), 'exposed-args-'));
  try {
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ scripts: { check: 'node args.cjs' } }),
    );
    await writeFile(
      join(root, 'args.cjs'),
      'console.log("ARGS=" + JSON.stringify(process.argv.slice(2)))',
    );
    for (const packageManager of ['npm', 'pnpm'] as const) {
      const command = scriptCommand(
        { packageManager, scripts: { check: 'node args.cjs' } },
        'check',
        extra,
      );
      const { stdout } = await promisify(execFile)(
        command.command,
        command.args,
        { cwd: root },
      );
      assert.ok(stdout.includes('ARGS=' + JSON.stringify(extra)));
    }
    assert.throws(
      () =>
        scriptCommand(
          { packageManager: 'npm', scripts: { check: 'node args.cjs' } },
          'check',
          [42],
        ),
      /Invalid script arguments/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
