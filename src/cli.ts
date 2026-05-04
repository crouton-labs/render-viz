import { parseArgs } from "node:util";
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { loadBuiltin, loadConfigFile, listBuiltins, type Config } from "./config.js";
import { gatherContext, type ContextSource } from "./context.js";
import { generateVisualization } from "./render.js";

const { values } = parseArgs({
  options: {
    context: { type: "string", default: "transcript" },
    transcript: { type: "string" },
    file: { type: "string" },
    builtin: { type: "string" },
    config: { type: "string" },
    model: { type: "string" },
    "max-turns": { type: "string", default: "10" },
    "dry-run": { type: "boolean", default: false },
    session: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (values.help) {
  printHelp();
  process.exit(0);
}

const source = values.context as ContextSource;
if (!["transcript", "last-message", "stdin", "file"].includes(source)) {
  console.error(`Error: invalid --context value: ${source}`);
  process.exit(1);
}

if (values.builtin && values.config) {
  console.error("Error: --builtin and --config are mutually exclusive");
  process.exit(1);
}

if (!values.builtin && !values.config) {
  console.error("Error: either --builtin or --config is required");
  process.exit(1);
}

const maxTurns = parseInt(values["max-turns"]!, 10);
if (!Number.isFinite(maxTurns) || maxTurns < 1) {
  console.error(`Error: invalid --max-turns: ${values["max-turns"]}`);
  process.exit(1);
}

const config: Config = values.builtin
  ? loadBuiltin(values.builtin)
  : loadConfigFile(values.config!);

if (values.model) {
  config.model = values.model;
}

const context = await gatherContext({
  source,
  transcriptPath: values.transcript,
  filePath: values.file,
  maxMessages: config.max_messages,
  maxChars: config.max_chars,
});

const userPrompt = config.prompt.replace("{{context}}", context);

const result = await generateVisualization({
  config,
  userPrompt,
  maxTurns,
});

if (!result) {
  process.exit(0);  // Haiku opted out
}

if (values["dry-run"]) {
  process.stdout.write(result.markdown + "\n");
  result.cleanup();
  process.exit(0);
}

function resolvePane(session: string | undefined): { args: string[]; sessionFile: string | null } {
  if (!session) return { args: ["--tmux"], sessionFile: null };

  const sessionFile = `/tmp/render-viz-${session}`;
  if (existsSync(sessionFile)) {
    const content = readFileSync(sessionFile, "utf-8");
    const match = content.match(/^pane=(.+)$/m);
    if (match) {
      const paneId = match[1].trim();
      const check = spawnSync("tmux", ["display-message", "-p", "-t", paneId, "#{pane_id}"], {
        encoding: "utf-8",
      });
      if (check.status === 0 && check.stdout.trim()) {
        return { args: ["--pane", paneId], sessionFile };
      }
    }
  }
  return { args: ["--tmux"], sessionFile: null };
}

const { args: paneArgs } = resolvePane(values.session);

const child = spawn("termrender", [...paneArgs, result.tempFile], {
  stdio: ["inherit", "pipe", "inherit"],
});

let paneId = "";
child.stdout!.on("data", (chunk: Buffer) => {
  paneId += chunk.toString();
});

child.on("exit", (code) => {
  const trimmedId = paneId.trim();
  if (trimmedId && values.session) {
    const sessionFile = `/tmp/render-viz-${values.session}`;
    if (existsSync(sessionFile)) {
      let content = readFileSync(sessionFile, "utf-8");
      if (content.match(/^pane=.+$/m)) {
        content = content.replace(/^pane=.+$/m, `pane=${trimmedId}`);
      } else {
        content = content.trimEnd() + `\npane=${trimmedId}\n`;
      }
      writeFileSync(sessionFile, content);
    }
  }
  setTimeout(() => result.cleanup(), 5000).unref();
  process.exit(code ?? 0);
});

function printHelp(): void {
  console.log(`render-viz - Generate and display termrender visualizations

Usage:
  render-viz --builtin <name> --transcript <path>
  render-viz --config <path> --context stdin < input.md
  render-viz --config <path> --context file --file <path>

Options:
  --context <source>     transcript | last-message | stdin | file (default: transcript)
  --transcript <path>    Claude transcript JSONL (for transcript/last-message)
  --file <path>          File to read as context (for context=file)
  --builtin <name>       Use a builtin config: ${listBuiltins().join(", ")}
  --config <path>        Path to a YAML config file
  --model <id>           Override config model
  --max-turns <n>        Max agentic turns for Haiku's self-correction (default: 10)
  --dry-run              Print markdown to stdout instead of opening tmux pane
  --session <id>         Reuse tmux pane across invocations (pane ID persisted per session)
  -h, --help             Show this help`);
}
