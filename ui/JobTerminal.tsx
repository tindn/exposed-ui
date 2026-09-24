import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import type { Job } from '../shared/types';
import { useSession } from '../state/session';
import { errorMessage } from '../shared/types';
import { Typography } from './shared/Typography';

export function JobTerminal({ job }: { job: Job }) {
  const host = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const position = useRef<number | null>(null);
  const latest = useRef(job);
  latest.current = job;
  const token = useSession((state) => state.token);
  const connected = useSession((state) => state.connected);
  const canInput = useRef(false);
  canInput.current = connected && job.status === 'running';
  const [error, setError] = useState('');
  useEffect(() => {
    if (!host.current) return;
    let disposed = false;
    let queue = Promise.resolve();
    const controller = new AbortController();
    const send = (path: string, body: object) => {
      queue = queue
        .then(async () => {
          if (disposed || !canInput.current) return;
          const response = await fetch(
            `/api/${path}?token=${encodeURIComponent(token)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: job.id, ...body }),
              signal: controller.signal,
            },
          );
          if (!response.ok)
            throw new Error(
              (await response.json()).error || 'Terminal request failed',
            );
        })
        .catch((error) => {
          if (!disposed) setError(errorMessage(error));
        });
    };
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'monospace',
      scrollback: 5000,
      theme: { background: '#0b0e0c', foreground: '#c5d3be' },
      disableStdin: !canInput.current,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host.current);
    terminal.current = term;
    position.current = null;
    const output = latest.current;
    term.write(output.logs.join(''));
    position.current = (output.logOffset || 0) + output.logs.join('').length;
    const input = term.onData((data) => {
      if (!canInput.current) return;
      setError('');
      for (let offset = 0; offset < data.length; offset += 512)
        send('input', { data: data.slice(offset, offset + 512) });
    });
    const resize = () => {
      if (!host.current?.clientWidth || !host.current.clientHeight) return;
      fit.fit();
      send('resize', {
        cols: Math.min(500, term.cols),
        rows: Math.min(200, term.rows),
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host.current);
    resize();
    return () => {
      disposed = true;
      controller.abort();
      observer.disconnect();
      input.dispose();
      term.dispose();
      terminal.current = null;
    };
  }, [job.id, token]);
  useEffect(() => {
    const term = terminal.current;
    if (!term) return;
    term.options.disableStdin = !connected || job.status !== 'running';
    const offset = job.logOffset || 0;
    const output = job.logs.join('');
    if (
      position.current === null ||
      position.current < offset ||
      position.current > offset + output.length
    ) {
      term.reset();
      term.write(output);
    } else term.write(output.slice(position.current - offset));
    position.current = offset + output.length;
  }, [job.logs, job.logOffset, job.status, connected]);
  return (
    <>
      {!!error && <Typography variant="warning">{error}</Typography>}
      <div
        ref={host}
        aria-label="Job terminal"
        style={{
          flex: 1,
          minHeight: 300,
          minWidth: 0,
          padding: 16,
          overflow: 'hidden',
        }}
      />
    </>
  );
}
