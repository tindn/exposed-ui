import type { Device, Inventory } from '../shared/types.js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
const exec = promisify(execFile);
const sdk =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  join(homedir(), 'Library/Android/sdk');
export const adb = existsSync(join(sdk, 'platform-tools/adb'))
  ? join(sdk, 'platform-tools/adb')
  : 'adb';
export const emulator = existsSync(join(sdk, 'emulator/emulator'))
  ? join(sdk, 'emulator/emulator')
  : 'emulator';
export async function discover(): Promise<Inventory> {
  const devices: Device[] = [],
    warnings: string[] = [];
  await Promise.all([
    (async () => {
      if (process.platform !== 'darwin') return;
      try {
        const { stdout } = await exec(
          'xcrun',
          ['simctl', 'list', 'devices', 'available', '--json'],
          { timeout: 10000 },
        );
        for (const [runtime, list] of Object.entries(
          (
            JSON.parse(stdout) as {
              devices: Record<
                string,
                { udid: string; name: string; state: string }[]
              >;
            }
          ).devices,
        ))
          for (const d of list)
            devices.push({
              id: d.udid,
              name: d.name,
              platform: 'ios',
              type: 'simulator',
              state: d.state,
              runtime: runtime.split('.').at(-1),
            });
      } catch {
        warnings.push(
          'iOS simulators unavailable. Check Xcode and its selected command line tools.',
        );
      }
    })(),
    (async () => {
      try {
        const { stdout } = await exec(adb, ['devices', '-l'], {
          timeout: 10000,
        });
        for (const line of stdout
          .split('\n')
          .slice(1)
          .filter((l) => l.trim())) {
          const [id, state] = line.trim().split(/\s+/);
          devices.push({
            id,
            name: line.match(/model:(\S+)/)?.[1]?.replaceAll('_', ' ') || id,
            state,
            platform: 'android',
            type: 'connected',
          });
        }
      } catch {
        warnings.push(
          'Android device discovery unavailable. Install Android SDK platform tools.',
        );
      }
    })(),
    (async () => {
      try {
        const { stdout } = await exec(emulator, ['-list-avds'], {
          timeout: 10000,
        });
        for (const name of stdout.trim().split('\n').filter(Boolean))
          devices.push({
            id: name,
            name,
            state: 'Available',
            platform: 'android',
            type: 'avd',
          });
      } catch {
        warnings.push(
          'Android emulator discovery unavailable. Check the Android SDK.',
        );
      }
    })(),
  ]);
  return { devices, warnings };
}
