# Security policy

## Reporting a vulnerability

Please report security vulnerabilities privately, by email to **rhyneer.silas@gmail.com**. Do not open a public GitHub issue or pull request for a suspected vulnerability.

Include what you found, the version (`npm ls -g @crouton-kit/render-viz`) and platform, and the steps or a proof of concept that reproduce it. If the report involves a token or credential, redact it.

Reports are read by a single maintainer, and no response time is guaranteed. Fix timelines depend on severity and on what the fix involves. Say in your report if you want credit in the fix.

## Supported versions

Fixes land on `main` and ship in the next published release. Only the latest published version is supported.

## What is in scope

The code in this repository: the `render-viz` command in [`src`](src) and the built-in configs in [`configs`](configs). Of particular interest:

- Transcript, stdin or file content that makes `render-viz` itself (outside the model's session) run a command or write a file.
- `render-viz` writing or reading a temporary file somewhere other than where it should.

`render-viz` sends the transcript or text you give it to a Claude model through the Claude Code SDK, using your own Claude Code sign-in. The model runs with the `Bash`, `Write`, `Read` and `Edit` tools and with permission prompts bypassed, so that it can write the markdown file and run `termrender --check` on it. That is how it works, not a vulnerability; run it on transcripts you trust. Problems in Claude Code or in [termrender](https://github.com/crouton-labs/termrender) belong in their own repositories.
