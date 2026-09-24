import { readFile, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, dirname, isAbsolute } from 'node:path';
import { homedir } from 'node:os';

export async function loadProject(input: unknown) {
  if (typeof input !== 'string' || !input.trim())
    throw new Error('Enter an Expo project folder.');
  let path = input.trim();
  if (path === '~') path = homedir();
  else if (path.startsWith('~/')) path = resolve(homedir(), path.slice(2));
  if (!isAbsolute(path))
    throw new Error('Use an absolute path or a path starting with ~/.');
  try {
    path = await realpath(path);
  } catch {
    throw new Error('That folder does not exist or cannot be accessed.');
  }
  let pkg: {
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  try {
    pkg = JSON.parse(await readFile(resolve(path, 'package.json'), 'utf8'));
  } catch {
    throw new Error('This folder needs a valid package.json.');
  }
  const version = pkg.dependencies?.expo || pkg.devDependencies?.expo;
  if (!version)
    throw new Error(
      'This folder is not an Expo project. Choose the app folder that declares Expo.',
    );
  let cli;
  try {
    const require = createRequire(resolve(path, 'package.json'));
    cli = resolve(dirname(require.resolve('expo/package.json')), 'bin/cli');
    await readFile(cli);
  } catch {
    throw new Error('Install this project’s dependencies before opening it.');
  }
  return {
    name: pkg.name || path.split('/').at(-1) || path,
    path,
    expo: version,
    cli,
  };
}
