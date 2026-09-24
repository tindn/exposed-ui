import { readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Project } from '../shared/types.js';

type PackageManager = Project['packageManager'];
export async function readScripts(path: string) {
  const pkg = JSON.parse(await readFile(join(path, 'package.json'), 'utf8'));
  const scripts: Record<string, string> = Object.fromEntries(
    Object.entries(pkg.scripts || {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
  let directory = path;
  while (true) {
    let manifest;
    try {
      manifest = JSON.parse(
        await readFile(join(directory, 'package.json'), 'utf8'),
      );
    } catch {}
    if (typeof manifest?.packageManager === 'string') {
      const manager = manifest.packageManager.split('@')[0];
      if (!['npm', 'pnpm', 'yarn', 'bun'].includes(manager))
        throw new Error(`Unsupported package manager: ${manager}`);
      return { scripts, packageManager: manager as PackageManager };
    }
    for (const [file, manager] of [
      ['pnpm-lock.yaml', 'pnpm'],
      ['yarn.lock', 'yarn'],
      ['bun.lock', 'bun'],
      ['bun.lockb', 'bun'],
      ['package-lock.json', 'npm'],
    ] as const) {
      try {
        await access(join(directory, file));
        return { scripts, packageManager: manager };
      } catch {}
    }
    const parent = dirname(directory);
    if (parent === directory)
      return { scripts, packageManager: 'npm' as const };
    directory = parent;
  }
}
export function scriptCommand(
  project: Pick<Project, 'scripts' | 'packageManager'>,
  name: unknown,
  extra: unknown = [],
) {
  if (
    typeof name !== 'string' ||
    name.startsWith('-') ||
    !Object.hasOwn(project.scripts, name)
  )
    throw new Error('Choose a script defined in this project’s package.json.');
  if (
    !Array.isArray(extra) ||
    extra.length > 100 ||
    extra.some((arg) => typeof arg !== 'string' || arg.includes('\0'))
  )
    throw new Error('Invalid script arguments.');
  return {
    command: project.packageManager,
    args: [
      'run',
      name,
      ...(project.packageManager === 'npm' && extra.length ? ['--'] : []),
      ...extra,
    ],
  };
}
