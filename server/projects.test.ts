import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadProject } from './projects.js';
test('validates project folders and resolves installed Expo', async () => {
  const path = await mkdtemp(join(tmpdir(), 'exposed-project-'));
  try {
    await assert.rejects(loadProject(''), /Enter/);
    await assert.rejects(loadProject('relative/path'), /absolute/);
    await assert.rejects(loadProject(path), /package.json/);
    await writeFile(
      join(path, 'package.json'),
      JSON.stringify({ name: 'fixture' }),
    );
    await assert.rejects(loadProject(path), /not an Expo/);
    await writeFile(
      join(path, 'package.json'),
      JSON.stringify({ name: 'fixture', dependencies: { expo: '*' } }),
    );
    await assert.rejects(loadProject(path), /dependencies/);
    await mkdir(join(path, 'node_modules/expo/bin'), { recursive: true });
    await writeFile(join(path, 'node_modules/expo/package.json'), '{}');
    await writeFile(join(path, 'node_modules/expo/bin/cli'), '');
    assert.equal((await loadProject(path)).name, 'fixture');
  } finally {
    await rm(path, { recursive: true, force: true });
  }
});
