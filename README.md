# Exposed UI

A local control panel for Expo. React Native Web UI, Expo web export, and a local Node server. Package: `exposed-ui`; command: `exposed`.

## Setup

```sh
npm install
npm run build
```

## Run

Launch from any directory, then paste an absolute or ~/ path into the dashboard:

```sh
node ./bin/cli.js
```

Or pass the project path:

```sh
node ./bin/cli.js ~/projects/my-expo-app
```

Add `--no-open` to print the session URL without opening a browser. Optional: run `npm link` in this package to enable `exposed`.

## First version

- Start Metro on port 8081, optionally clearing its cache.
- Discover available iOS simulators, Android virtual devices, and ADB devices.
- Boot simulators/emulators; refresh device discovery afterward.
- Build and install with the target project's Expo CLI (`run:ios` / `run:android --device … --no-bundler`). These commands can generate native folders; start Metro separately.
- Stream bounded per-job output with server-sent events; reconnect after refresh.
- Stop process groups; Ctrl+C shuts down the dashboard and its jobs.

The server listens on loopback with a per-session token and same-origin checks. Arbitrary command strings are not accepted. Commands run in CI mode; required interactive prompts fail visibly in logs. Port conflicts are reported rather than silently choosing another Metro port.

Physical iOS devices, Expo Go QR codes, interactive terminal prompts, EAS builds, and Windows process-tree support are outside this first version. Android SDK and Xcode must already be installed for their respective actions. Refresh devices manually after state changes. Logs live in memory until the CLI exits.

## Develop

`npm run dev` previews the UI with Expo; live command actions require the exported UI served by the CLI. After UI edits, run `npm run build` and refresh the running dashboard. Backend edits require `npm run build:server` and restarting the CLI.

`npm test` exercises process output, duplicate protection, failures, and cancellation.

Project selection validates the app’s Expo dependency and installed CLI. Recent projects are stored in `.recent-projects.json` beside the tool. Each launch starts with no selected project unless a path is passed. Stop running jobs before switching; completed session logs clear on a successful switch. Device discovery and booting work before project selection.

## TypeScript

TypeScript 7.0.2 checks the UI, server, and tests in strict mode via `npm run typecheck`. The UI uses bundler resolution; the backend uses NodeNext and emits JavaScript into `build/`. `bin/cli.js` is a small launcher for the compiled backend. `npm run build` checks types, compiles the backend, and exports the web UI. Requires Node 22 or newer.

The Expo scripts disable automatic TypeScript setup because Expo SDK 57 otherwise selects TypeScript 6. Type checking is handled explicitly by the pinned TypeScript 7 compiler.
