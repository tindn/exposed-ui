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
  assert.match(job.logs.join(''), /ENOENT/);
});
