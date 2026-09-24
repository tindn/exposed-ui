import type { IPty } from 'node-pty';
import { spawn } from 'node-pty';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import type { Job } from '../shared/types.js';
import { errorMessage } from '../shared/types.js';

type ManagedJob = Job & { timer?: ReturnType<typeof setTimeout> };
export class Processes extends EventEmitter {
  jobs: ManagedJob[] = [];
  children = new Map<string, IPty>();
  start(
    label: string,
    command: string,
    args: string[],
    cwd: string,
    kind = label,
  ) {
    if (
      this.jobs.some(
        (j) => j.kind === kind && ['running', 'stopping'].includes(j.status),
      )
    )
      throw new Error(`${label} is already running`);
    const job: ManagedJob = {
      id: randomUUID(),
      label,
      kind,
      status: 'running',
      startedAt: new Date().toISOString(),
      logs: [],
      logOffset: 0,
    };
    this.jobs.push(job);
    const log = (data: string) => {
      job.logs.push(data);
      while (job.logs.length > 600)
        job.logOffset = (job.logOffset || 0) + job.logs.shift()!.length;
      this.emit('change');
    };
    try {
      const env = Object.fromEntries(
        Object.entries(process.env).filter(
          (entry): entry is [string, string] => entry[1] !== undefined,
        ),
      );
      delete env.CI;
      delete env.NO_COLOR;
      delete env.FORCE_COLOR;
      const child = spawn(command, args, {
        cwd,
        env: { ...env, TERM: 'xterm-256color', COLORTERM: 'truecolor' },
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
      });
      this.children.set(job.id, child);
      child.onData(log);
      child.onExit(({ exitCode, signal }) => {
        clearTimeout(job.timer);
        delete job.timer;
        job.status =
          job.status === 'stopping'
            ? 'stopped'
            : exitCode === 0
              ? 'completed'
              : 'failed';
        if (job.status === 'failed' && !job.logs.length)
          log(
            `${command} exited with code ${exitCode}. Check that the executable is installed.\r\n`,
          );
        job.exitCode = exitCode;
        job.signal = signal == null ? null : String(signal);
        this.children.delete(job.id);
        this.emit('change');
      });
    } catch (error) {
      job.status = 'failed';
      log(errorMessage(error));
    }
    this.emit('change');
    return job.id;
  }
  input(id: string, data: string) {
    const child = this.children.get(id);
    if (!child || this.jobs.find((job) => job.id === id)?.status !== 'running')
      throw new Error('This job is no longer accepting input.');
    child.write(data);
  }
  resize(id: string, cols: number, rows: number) {
    if (
      !Number.isInteger(cols) ||
      !Number.isInteger(rows) ||
      cols < 2 ||
      rows < 1 ||
      cols > 500 ||
      rows > 200
    )
      throw new Error('Invalid terminal dimensions.');
    this.children.get(id)?.resize(cols, rows);
  }
  stop(id: string) {
    const child = this.children.get(id);
    const job = this.jobs.find((j) => j.id === id);
    if (!child || !job || job.status === 'stopping') return;
    job.status = 'stopping';
    const kill = (signal: NodeJS.Signals) => {
      try {
        process.platform === 'win32'
          ? child.kill(signal)
          : process.kill(-child.pid, signal);
      } catch (error) {
        if (!(
          error instanceof Error &&
          'code' in error &&
          error.code === 'ESRCH'
        ))
          throw error;
      }
    };
    kill('SIGTERM');
    job.timer = setTimeout(() => kill('SIGKILL'), 4000);
    job.timer.unref();
    this.emit('change');
  }
  clear(id: string) {
    const job = this.jobs.find((entry) => entry.id === id);
    if (!job) return;
    if (this.children.has(id) || ['running', 'stopping'].includes(job.status))
      throw new Error('Stop the job before clearing it.');
    this.jobs = this.jobs.filter((entry) => entry.id !== id);
    this.emit('change');
  }
  snapshot() {
    return this.jobs.map(({ timer, ...job }) => job);
  }
}
