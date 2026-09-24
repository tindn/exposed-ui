import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const notices = [
  'Third-party dependency notices\n\nIncludes dependencies used to build and run expo sed-ui. Each retains its own license.',
];
for (const path of Object.keys(lock.packages).filter(Boolean).sort()) {
  let files;
  try {
    files = await readdir(path);
  } catch (error) {
    if (error.code === 'ENOENT' && lock.packages[path].optional) continue;
    throw error;
  }
  const licenses = files.filter((file) =>
    /^(licen[cs]e|copying|notice)(\.|$)/i.test(file),
  );
  if (!licenses.length) continue;
  const pkg = JSON.parse(await readFile(join(path, 'package.json'), 'utf8'));
  for (const file of licenses) {
    try {
      const text = await readFile(join(path, file), 'utf8');
      notices.push(`${pkg.name}@${pkg.version} — ${file}\n\n${text}`);
    } catch (error) {
      if (error.code !== 'EISDIR') throw error;
    }
  }
}
await writeFile(
  'THIRD_PARTY_NOTICES.txt',
  notices.join('\n\n========================================\n\n'),
);
