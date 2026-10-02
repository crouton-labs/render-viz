# Contributing to render-viz

Issues and pull requests are welcome at [github.com/crouton-labs/render-viz](https://github.com/crouton-labs/render-viz).

## Before you start

- **Bugs:** open an issue with the render-viz version (`npm ls -g @crouton-kit/render-viz`), your OS, and the command that failed with its output. Run it with `--dry-run` first if you can, and include the markdown it printed.
- **Features and larger changes:** open an issue first, so the direction is agreed before you write the code.
- **Questions:** ask in [Discord](https://discord.gg/afwW4saEtr) or open an issue.
- **Security problems:** do not open a public issue. See [SECURITY.md](SECURITY.md).

## Set up

You need Node.js and pnpm. `package.json` sets no `engines` and the repository has no CI, so there is no required Node version; the dependencies work on current Node releases. The committed lockfile is `pnpm-lock.yaml`. To run the tool you also need Claude Code and `termrender`, as listed in the [README](README.md).

```bash
git clone git@github.com:crouton-labs/render-viz.git
cd render-viz
pnpm install
pnpm build
```

`pnpm build` bundles `src/cli.ts` with esbuild into `bin/render-viz`, which is gitignored. Run it with `node bin/render-viz -h`.

## Run the tests

There is no test suite yet. Run `pnpm build` and `npx tsc --noEmit` before you push, then try your change with `--dry-run` on a transcript.

## Pull requests

- Branch from the current `main`, and keep one change per pull request.
- Describe what changed and why in the pull request body, and say how you tested it.
- Keep the history linear: rebase onto `main` rather than merging it into your branch.
- Commit messages follow the style of the existing log: a short imperative subject, with a prefix such as `feat:` or `docs:`.

## Repository layout

| Path | Contents |
|---|---|
| [`src`](src) | The CLI, config loading, transcript parsing, and the model and `termrender` calls |
| [`configs`](configs) | The built-in YAML configs: `summary`, `debug`, `plan`, `arch` |

## License

render-viz is licensed under GPL-3.0-only. By contributing, you agree that your contribution is licensed under the same terms.
