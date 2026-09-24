# Working on expo sed-ui

Guidance for human contributors and AI coding tools. Keep this file aligned with the project as it evolves.

## Project

- Display name: `expo sed-ui`. Package/repository: `exposed-ui`. CLI command: `exposed`.
- A local command and device dashboard for Expo development. Users continue editing code in their preferred editor.
- Launch the dashboard independently → paste an Expo project folder path → run project scripts and interact with their terminals.
- macOS is the verified platform. Linux is unverified; Windows is currently unsupported.

## Architecture

- React Native components render through React Native Web; Expo exports the browser assets. The application runs in a browser with a local Node backend.
- Zustand owns shared session state. TypeScript 7 checks the UI and backend; consult `package.json` for pinned versions.
- The backend serves the exported UI and streams session updates through server-sent events. Commands run through node-pty; xterm.js provides interactive terminals.
- The terminal's DOM integration is isolated in `ui/JobTerminal.tsx`.

## Repository map

- `App.tsx` → application composition; `ui/` → dashboard-specific components; `ui/shared/` → reusable UI components.
- `state/` → client session state and API integration; `shared/` → client/server contracts and utilities.
- `server/` → HTTP API, project validation, device discovery, scripts, and process lifecycle.
- `bin/cli.js` → launcher; `scripts/` → packaging and installation helpers.
- `build/` and `dist/` → generated server and browser output. Make changes in source files.

## Development workflow

- Install dependencies: `npm install`. Requires Node 22 or newer.
- Format with Prettier: `npm run format`; check formatting: `npm run format:check`.
- Build: `npm run build` → typecheck → compile backend → export browser UI.
- Launch from this repository: `node bin/cli.js`, optionally followed by a project path and/or `--no-open`.
- UI edits → rebuild → refresh the browser. Backend edits → `npm run build:server` → restart the dashboard.
- `npm run dev` previews the UI through Expo; live command actions use the exported UI served by the backend.
- CI checks formatting and builds. Existing tests are available through `npm test`; follow the task's requested verification scope.

## Runtime behavior

- Listen on loopback at `127.0.0.1:3880`. Report an occupied port instead of silently selecting another one.
- A launch creates a session token. The browser reads it from the URL fragment, saves it in local storage, and clears the fragment; the header shows a shortened value with full-value copying.
- Preserve authentication and same-origin checks on API access.
- Read scripts from the selected project's `package.json`. Detect its package manager, including workspace ancestors, and pass additional arguments as argument arrays.
- Inspect active jobs before restarting the backend. A restart stops its jobs; coordinate with the user before interrupting active work.
- Store recent projects in `$XDG_CONFIG_HOME/exposed-ui`, defaulting to `~/.config/exposed-ui`, outside the installed package.

## Distribution

- License: Unlicense. Preserve third-party license notices.
- Publish releases through GitHub and `tindn/homebrew-tap`. npm is used for local tooling and tarball creation; npm registry publishing is outside the current distribution plan.
- `npm pack` builds the application and generates dependency notices. Keep local configuration, credentials, and private project paths out of release artifacts and public history.
- Follow [RELEASING.md](RELEASING.md) for release and Homebrew updates. Documentation-only edits do not require a new binary release.
