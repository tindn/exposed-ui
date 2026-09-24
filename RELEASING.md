# Releasing

## npm

1. Sign in to npm with 2FA enabled and confirm ownership or availability of `exposed-ui`.
2. Update the version and run `npm run format`.
3. Run `npm pack` to build the server and web assets and create the release tarball.
4. Inspect `tar -tzf exposed-ui-<version>.tgz`. The package must include `bin/`, compiled server/shared JavaScript, `dist/`, the PTY install hook, and Unlicense. Local config and source tests are excluded.
5. Publish the inspected artifact with `npm publish ./exposed-ui-<version>.tgz --access public`.
6. Tag the released commit and create a GitHub release, attaching the same tarball.

Only node-pty is a runtime dependency. Expo, React Native Web, and the other UI packages are bundled during the build. Preserve third-party license notices in distributed assets.

## Homebrew

Create a public `tindn/homebrew-tap` repository with `Formula/exposed-ui.rb`. The formula needs a published release tarball URL, its SHA-256 checksum, `license "Unlicense"`, a Node dependency, and Python as a build dependency for node-pty.

Use Homebrew's `std_npm_args` installation into `libexec`, then link its `exposed` executable into `bin`. Native dependencies need their install scripts enabled and reviewed. Account for the Node ABI when updating the formula.

The intended installation command, after the tap is published, is:

```sh
brew install tindn/tap/exposed-ui
exposed
```

A tarball attached to a GitHub release can also be used, so npm publication is optional for Homebrew. Each release requires updating the formula URL and checksum. Prebuilt Homebrew bottles can be added later to avoid compiling native dependencies during installation.

Homebrew packaging is pending the first public release; no formula has been published yet.

References: [Homebrew taps](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap), [Node formula packaging](https://docs.brew.sh/Language-Specific-Formulae#nodejs).
