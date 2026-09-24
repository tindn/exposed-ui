# Releasing

Distribution uses GitHub Releases and the [Homebrew tap](https://github.com/tindn/homebrew-tap). npm is used locally to build and package; registry publishing is unnecessary.

1. Update the version in package.json and package-lock.json.
2. Run `npm run format`, then `npm pack` to build the server, UI, and third-party notices.
3. Inspect the tarball contents. Include compiled server/shared JavaScript, `dist/`, CLI, PTY install hook, and license notices; exclude local configuration.
4. Commit and push, then create a versioned GitHub release with the tarball attached.
5. Update `Formula/exposed-ui.rb` in the tap with the release URL and SHA-256 checksum (`shasum -a 256 exposed-ui-<version>.tgz`).
6. Commit and push the tap update. Users receive it through `brew update` and `brew upgrade`.

Only node-pty is a runtime dependency. Expo and React Native Web are bundled at build time. The formula declares Node and Python for native compilation and enables required installation hooks. Node major upgrades can require rebuilding the native addon. Homebrew bottles may be added later.

User configuration lives outside the installation at `$XDG_CONFIG_HOME/exposed-ui` (default `~/.config/exposed-ui`).

References: [Homebrew taps](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap), [Node formula packaging](https://docs.brew.sh/Language-Specific-Formulae#nodejs).
