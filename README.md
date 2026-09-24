# expo sed-ui

A local control panel for Expo. React Native Web UI, Expo web export, and a local Node server. Package: `exposed-ui`; command: `exposed`.

## Install

Install with Homebrew:

```sh
brew install tindn/tap/exposed-ui
exposed
```

The formula installs Node and the dashboard. Your Expo project still needs its own dependencies and package manager installed. Release archives are also available on [GitHub Releases](https://github.com/tindn/exposed-ui/releases). No npm account is needed.

## Setup from source

```sh
npm install
npm run build
```

## Run

Launch from any directory, then paste an absolute or ~/ path into the dashboard:

```sh
node bin/cli.js
```

Or pass the project path:

```sh
node bin/cli.js ~/projects/my-expo-app
```

Add `--no-open` to print the session URL without opening a browser. Optional: run `npm link` in this package to enable `exposed`.

## First version

- Run scripts from the selected app’s package.json with npm, pnpm, yarn, or bun. The nearest packageManager declaration or lockfile selects the runner, including workspace ancestors. Refresh scripts after editing package.json.
- Discover available iOS simulators, Android virtual devices, and ADB devices.
- Boot simulators/emulators; refresh device discovery afterward.
- Build and install with the target project's Expo CLI (`run:ios` / `run:android --device … --no-bundler`). These commands can generate native folders; run the project’s development-server script separately.
- Stream bounded per-job output with server-sent events; reconnect after refresh.
- Stop process groups; Ctrl+C shuts down the dashboard and its jobs.

The dashboard uses the fixed address `http://127.0.0.1:3880` and exits with a clear error if the port is occupied. The server listens on loopback with a per-session token and same-origin checks. Arbitrary command strings are not accepted. Commands run in a PTY with interactive input enabled. Click the Activity terminal to type, answer prompts, use arrows, or send Ctrl+C. Stop job terminates the process group. Ports and command options come from the project’s own scripts.

Physical iOS devices, Expo Go QR codes, EAS builds, and Windows process-tree support are outside this first version. Android SDK and Xcode must already be installed for their respective actions. Refresh devices manually after state changes. Logs live in memory until the CLI exits. Terminal replay retains the latest 600 output chunks; older screen history can be truncated.

## Develop

`npm run dev` previews the UI with Expo; live command actions require the exported UI served by the CLI. After UI edits, run `npm run build` and refresh the running dashboard. Backend edits require `npm run build:server` and restarting the CLI.

`npm test` exercises process output, duplicate protection, failures, and cancellation.

Project selection validates the app’s Expo dependency and installed CLI. Recent projects are stored in `$XDG_CONFIG_HOME/exposed-ui/recent-projects.json` (default: `~/.config/exposed-ui/recent-projects.json`). Each launch starts with no selected project unless a path is passed. Stop running jobs before switching; completed session logs clear on a successful switch. Device discovery and booting work before project selection.

## TypeScript

TypeScript 7.0.2 checks the UI, server, and tests in strict mode via `npm run typecheck`. The UI uses bundler resolution; the backend uses NodeNext and emits JavaScript into `build/`. `bin/cli.js` is a small launcher for the compiled backend. `npm run build` checks types, compiles the backend, and exports the web UI. Requires Node 22 or newer.

The Expo scripts disable automatic TypeScript setup because Expo SDK 57 otherwise selects TypeScript 6. Type checking is handled explicitly by the pinned TypeScript 7 compiler.

## UI composition

- `Card` owns its border, inner padding, and content gap. Its API exposes children; callers compose content inside those constraints.
- `Stack`, `Row`, and `Actions` own spacing, alignment, and wrapping. `DashboardLayout` owns page gutters, sidebar width, and the responsive column layout.
- `Typography`, `TextField`, and `Button` own their visual rules. Specialized panel styles stay in the component that uses them; shared colors live in `ui/shared/theme.ts`.

Reusable UI components live in `ui/shared/`. Dashboard-specific components live directly in `ui/`. The root `shared/` folder contains contracts shared with the server.

Interactive terminals use node-pty and xterm.js. The macOS install hook repairs the executable bit on the bundled PTY helper. Native module installation may require Xcode command line tools. The terminal DOM integration is isolated in `ui/JobTerminal.tsx`.

## Formatting and contributions

Use `npm run format` to format files with Prettier. CI runs `npm run format:check` and `npm run build`. Open an issue or pull request on GitHub with a focused description of the change. Include screenshots for UI changes.

## Platform support

Development has been verified on macOS. Linux support is unverified; Windows is not currently supported. Install your project's dependencies and package manager before launching scripts. iOS actions require Xcode; Android actions require the Android SDK and emulator tools on PATH.

## License

[Unlicense](UNLICENSE). Third-party dependencies retain their own licenses.

See [RELEASING.md](RELEASING.md) for npm and Homebrew distribution.
