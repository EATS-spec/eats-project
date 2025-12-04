# Agent Workflow Notes

## Browser / DevTools Agent

- Primary path: use the Chrome DevTools MCP server launched by Codex (`npx chrome-devtools-mcp@latest`).
- Fallback path (if Codex reports `tool call failed`): follow `docs/CHROME_DEVTOOLS_MCP.md` for the inspector CLI workflow (`npx @modelcontextprotocol/inspector-cli --cli …`). The CLI restart reliably opens Chrome, calls `new_page`, and supports snapshots/evaluations.
- Keep this doc in sync whenever we change the browser automation procedure so other agents know where to look.
