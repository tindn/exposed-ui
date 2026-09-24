import test from 'node:test';
import assert from 'node:assert/strict';
import { useSession } from '../state/session.js';
import type { DashboardState } from '../shared/types.js';

test('streamed logs preserve unrelated panel state and update the active job lifecycle', () => {
  const snapshot: DashboardState = {
    project: {
      name: 'demo',
      path: '/demo',
      expo: '57',
      scripts: {},
      packageManager: 'npm',
    },
    devices: [
      {
        id: 'phone',
        name: 'Phone',
        platform: 'ios',
        type: 'simulator',
        state: 'Booted',
      },
    ],
    recentProjects: [],
    warnings: [],
    scanning: false,
    jobs: [
      {
        id: 'metro',
        kind: 'metro',
        label: 'Metro',
        status: 'running',
        startedAt: 'now',
        logs: ['Starting'],
      },
    ],
  };
  useSession.getState().receive(snapshot);
  const previous = useSession.getState();
  let deviceChanges = 0;
  const unsubscribe = useSession.subscribe((next, old) => {
    if (next.devices !== old.devices || next.active !== old.active)
      deviceChanges++;
  });
  const updated = structuredClone(snapshot);
  updated.jobs[0].logs.push('Bundled');
  useSession.getState().receive(updated);
  const next = useSession.getState();
  assert.equal(next.project, previous.project);
  assert.equal(next.devices, previous.devices);
  assert.equal(next.active, previous.active);
  assert.notEqual(next.jobs, previous.jobs);
  assert.equal(deviceChanges, 0);
  updated.jobs[0].status = 'completed';
  useSession.getState().receive(structuredClone(updated));
  assert.equal(useSession.getState().active.length, 0);
  assert.equal(deviceChanges, 1);
  unsubscribe();
});
