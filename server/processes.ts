import type { ChildProcess } from 'node:child_process';
import type { Job } from '../shared/types.js';
type ManagedJob = Job & { timer?: ReturnType<typeof setTimeout> };
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';

export class Processes extends EventEmitter {
  jobs: ManagedJob[] = [];
  children = new Map<string, ChildProcess>();
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
    };
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    this.jobs.push(job);
    this.children.set(job.id, child);
    const log = (data: Buffer | string) => {
      job.logs.push(data.toString());
      if (job.logs.length > 600) job.logs.shift();
      this.emit('change');
    };
    child.stdout.on('data', log);
    child.stderr.on('data', log);
    child.on('error', (error) => {
      log(error.message);
    });
    child.on('close', (code, signal) => {
      clearTimeout(job.timer);
      delete job.timer;
      job.status =
        job.status === 'stopping'
          ? 'stopped'
          : code === 0
            ? 'completed'
            : 'failed';
      job.exitCode = code;
      job.signal = signal;
      this.children.delete(job.id);
      this.emit('change');
    });
    this.emit('change');
    return job.id;
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
          : child.pid && process.kill(-child.pid, signal);
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
  snapshot() {
    return this.jobs.map(({ timer, ...job }) => job);
  }
}
