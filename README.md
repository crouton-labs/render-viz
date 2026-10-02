# render-viz — turn a Claude Code transcript into a termrender visualization in a tmux pane

![render-viz](https://raw.githubusercontent.com/crouton-labs/render-viz/main/assets/banner.svg)

<p align="center">
  <a href="https://www.npmjs.com/package/@crouton-kit/render-viz"><img alt="npm" src="https://img.shields.io/npm/v/@crouton-kit/render-viz?label=npm"></a>
</p>

render-viz reads a Claude Code transcript (or a message, file or stdin), asks a Claude model to write a short visual summary of it as [termrender](https://github.com/crouton-labs/termrender) markdown, and opens the result in a tmux pane. It is meant for the moment when an assistant reply is long and you want the shape of it at a glance: a diagram of the architecture, the plan as a tree, the debugging path.

The model writes the markdown to a temporary file and runs `termrender --check` on it, fixing errors until it validates. If the turn has nothing worth drawing, the model skips and render-viz exits without opening anything. The model call goes through the Claude Code SDK, using the `claude` executable it finds (`CLAUDE_CODE_EXECPATH`, which Claude Code sets for hooks, or `claude` on your `PATH`).

## Install

```bash
npm install -g @crouton-kit/render-viz
```

Requirements:

- [Claude Code](https://docs.claude.com/en/docs/claude-code) (`claude` on your `PATH`), signed in.
- [`termrender`](https://github.com/crouton-labs/termrender) on your `PATH` (`pip install termrender`).
- tmux, to display the result. `--dry-run` prints the markdown instead.

## Usage

Summarize a transcript with one of the built-in configs:

```bash
render-viz --builtin summary --transcript ~/.claude/projects/<project>/<session>.jsonl
```

Print the generated markdown instead of opening a pane:

```bash
render-viz --builtin plan --transcript <path> --dry-run
```

Use your own config on text from stdin or a file:

```bash
cat notes.md | render-viz --config my-config.yaml --context stdin
render-viz --config my-config.yaml --context file --file notes.md
```

Options: `--context` (`transcript`, `last-message`, `stdin` or `file`; default `transcript`), `--model` to override the config's model, `--max-turns` for the model's self-correction loop (default 10), and `--session <id>` to reuse one tmux pane across runs. `render-viz -h` lists them all.

## Configs

A config is a YAML file with `model`, `system_prompt`, a `prompt` that contains `{{context}}`, and optionally `max_messages` and `max_chars` to limit how much of the transcript is sent. Four are built in:

| Builtin | For | Model |
|---|---|---|
| `summary` | A scannable recap of one assistant turn | `claude-sonnet-4-6` |
| `debug` | A debugging investigation | `claude-haiku-4-5-20251001` |
| `plan` | An implementation plan | `claude-haiku-4-5-20251001` |
| `arch` | A feature spec or architecture document | `claude-haiku-4-5-20251001` |

The built-ins live in [`configs/`](configs) and make a good starting point for your own.

## Develop

```bash
git clone git@github.com:crouton-labs/render-viz.git
cd render-viz
npm install
npm run build   # bundles src/cli.ts into bin/render-viz
```
