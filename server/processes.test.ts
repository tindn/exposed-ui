import { stripVTControlCharacters } from 'node:util';
import test from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { Processes } from './processes.js';
async function finished(manager: Processes, id: string) {
  for (let i = 0; i < 100; i++) {
    const job = manager.snapshot().find((j) => j.id === id);
    if (job && !['running', 'stopping'].includes(job.status)) return job;
    await delay(50);
  }
  throw new Error('Process did not finish');
}
test('captures actual stdout, stderr and exit status', async () => {
  const p = new Processes();
  const id = p.start(
    'test',
    process.execPath,
    [
      '-e',
      'console.log("hello"); console.error("warning"); process.exitCode = 3',
    ],
    process.cwd(),
  );
  const job = await finished(p, id);
  assert.equal(job.status, 'failed');
  assert.equal(job.exitCode, 3);
  assert.match(job.logs.join(''), /hello/);
  assert.match(job.logs.join(''), /warning/);
});
test('rejects duplicates and cancels a running process', async () => {
  const p = new Processes();
  const id = p.start(
    'loop',
    process.execPath,
    ['-e', 'setInterval(() => {}, 1000)'],
    process.cwd(),
  );
  assert.throws(
    () => p.start('loop', process.execPath, [], process.cwd()),
    /already running/,
  );
  p.stop(id);
  const job = await finished(p, id);
  assert.equal(job.status, 'stopped');
  assert.equal(p.children.size, 0);
  assert.doesNotThrow(() => JSON.stringify(p.snapshot()));
});
test('reports missing executables without crashing the server', async () => {
  const p = new Processes();
  const id = p.start('missing', '/no/such/exposed-command', [], process.cwd());
  const job = await finished(p, id);
  assert.equal(job.status, 'failed');
  assert.match(job.logs.join(''), /exited|ENOENT|spawn/);
});

test('clears finished jobs and protects active jobs', async () => {
  const p = new Processes();
  const id = p.start(
    'clearable',
    process.execPath,
    ['-e', 'console.log("done")'],
    process.cwd(),
  );
  assert.throws(() => p.clear(id), /Stop the job/);
  await finished(p, id);
  let changed = false;
  p.once('change', () => {
    changed = true;
  });
  p.clear(id);
  assert.equal(p.snapshot().length, 0);
  assert.equal(changed, true);
  assert.doesNotThrow(() => p.clear(id));
});

test('PTY accepts prompt input, resizes, and delivers Ctrl+C', async () => {
  const p = new Processes();
  const id = p.start(
    'interactive',
    process.execPath,
    [
      '-e',
      `
    console.log('READY', process.stdin.isTTY, process.env.CI);
    process.stdin.on('data', data => console.log('REPLY', data.toString().trim()));
    process.on('SIGWINCH', () => console.log('SIZE', process.stdout.columns, process.stdout.rows));
    process.on('SIGINT', () => { console.log('INTERRUPTED'); process.exit(0); });
  `,
    ],
    process.cwd(),
  );
  const waitFor = async (pattern: RegExp) => {
    for (let i = 0; i < 100; i++) {
      const output = p
        .snapshot()
        .find((job) => job.id === id)!
        .logs.join('');
      if (pattern.test(stripVTControlCharacters(output))) return;
      await delay(30);
    }
    assert.fail(`Missing output: ${pattern}`);
  };
  try {
    await waitFor(/READY true undefined/);
    p.input(id, 'hello\r');
    await waitFor(/REPLY hello/);
    p.resize(id, 100, 35);
    await waitFor(/SIZE 100 35/);
    p.input(id, '\x03');
    await waitFor(/INTERRUPTED/);
    assert.equal((await finished(p, id)).status, 'completed');
    assert.throws(() => p.input(id, 'x'), /no longer/);
    assert.throws(() => p.resize(id, 0, 10), /dimensions/);
  } finally {
    p.stop(id);
  }
});
