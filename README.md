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

## Platform support

Development has been verified on macOS. Linux support is unverified; Windows is not currently supported. Install your project's dependencies and package manager before launching scripts. iOS actions require Xcode; Android actions require the Android SDK and emulator tools on PATH.

## License

[Unlicense](UNLICENSE). Third-party dependencies retain their own licenses.

See [RELEASING.md](RELEASING.md) for npm and Homebrew distribution.
