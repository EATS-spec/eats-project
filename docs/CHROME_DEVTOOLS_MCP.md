# Chrome DevTools MCP Quickstart

Use these steps any time the Codex bridge has trouble talking to the Chrome DevTools MCP server. The `@modelcontextprotocol/inspector-cli` shim gives you a reliable fallback that we already verified on this machine.

## Clean the old NPX cache (optional, but handy after version bumps)

```bash
npm cache clean --force
rm -rf ~/.npm/_npx
```

## Launch the MCP server manually (headless Chrome)

```bash
npx -y chrome-devtools-mcp@latest \
  --headless \
  --isolated \
  --executablePath="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Leave that running if you want to hit it from other terminals.

## Or drive it via the Inspector CLI (fire-and-forget)

1. Save this one-liner when you need to open a fresh page:

   ```bash
   npx @modelcontextprotocol/inspector-cli --cli \
     --method tools/call \
     --tool-name new_page \
     --tool-arg url=https://eats-frontend.vercel.app \
     --tool-arg timeout=60000 \
     -- chrome-devtools-mcp@latest
   ```

2. Replace `tools/call …` with any other tool (`take_snapshot`, `evaluate_script`, etc.) once the page is open.

Behind the scenes the CLI spins up the MCP server for that command, so there is nothing to keep running.

## Note on Codex integration

Codex still launches `npx chrome-devtools-mcp@latest` under the hood. The steps above prove the package works; if Codex’s built-in bridge reports `tool call failed`, the CLI fallback here is the quickest way to keep working while we debug the TUI bridge.
