# Assay

**Your agent places the trade. Your rules make the call.**

assay sits between an AI agent and the Binance MCP Server. Every order the agent proposes is priced against the real book and judged against your three rules before Binance ever sees it: oversized orders are resized to your cap, forbidden symbols are blocked, a red day halts everything, and every verdict cites the rule that fired in plain words, with the transcript hash attached.

Live: https://tryassay.vercel.app

Built for the Binance Agent OS Mini Hackathon (Track A). Deadline Sep 8, 2026 23:59 UTC.

## The judge path (90 seconds, no login)

1. Open https://tryassay.vercel.app : one screen says what Assay is. 15 seconds.
2. Click **Enter the desk**. REPLAY mode is default. Click **YOLO: 1,000 USDC into DOGE**: a 1,000 USDC order gets blocked on the allowlist rule, stamped on screen, real recorded DOGE price, sha256 shown. 20 seconds.
3. Click **Sane: 50 USDC into BTC**: the same order comes back RESIZED, 50.00 struck through, cut to 20.00, citing Rule 1: max 2% per trade. 20 seconds.
4. Click **Red day: any order after -6%**: HALTED. Rule 2 wins over everything. 15 seconds.
5. Switch to **LIVE**: real BTCUSDT ticker, real sub-account read through agent.binance.com/mcp/agentic. Propose any order: judged against the real account, honestly. 20 seconds.

## How it works

- **Rules engine** (`src/engine/rules.ts`): pure TypeScript. Orders are checked in a fixed order: daily halt first (rule 2), then allowlist (rule 3), then per-trade cap with resize (rule 1), then PASS. 11 unit tests cover the verdict matrix including halt-overrides-block and cap-boundary cases.
- **MCP client** (`src/mcp/binance.ts`): JSON-RPC 2.0 over streamable HTTP to `https://agent.binance.com/mcp/agentic`, authenticated with a scoped OAuth token (no local API keys; no withdrawal scope exists in the Agent OS model).
- **Transcript recorder**: every MCP exchange is stamped with a sha256 of the real response.
- **REPLAY mode** (`src/mcp/replay.ts`): the identical engine runs over committed, hash-verified transcripts of real MCP responses. Each frame's hash is recomputed at replay time; a mismatch refuses to render. This makes the demo deterministic without faking a single value.

## Honesty table

| Claim | Status | Evidence |
|---|---|---|
| Rules engine PASS/RESIZE/BLOCK/HALT | Works | 11 passing tests (`npx vitest run`) |
| REPLAY mode on real recorded data | Works | `src/data/replay/baseline.jsonl`, hashes recomputed client-side, visible on every card |
| LIVE market data through Binance MCP | Works | Real BTCUSDT ticker + sha256 on the LIVE card |
| LIVE account read through Binance MCP | Works | Real Agentic sub-account balances rendered (zero balance shown as zero) |
| LIVE order execution | Intentionally not wired | Verdicts stop before `spot.newOrder`; execution is one gated call away but a hackathon build has no business auto-executing. The check is the product. |
| Paper equity in REPLAY | Declared, labeled | REPLAY panel states paper equity 1,000 USDC (declared) inline |

## Stack

Next.js 16 · TypeScript · Tailwind v4 · Vitest. Deployed on Vercel. Design tokens mined from Binance's live theme (vessel `#181A20`, card `#202630`, brand yellow `#F0B90B` / action yellow `#FCD535`): no purple gradient, no bento.

## Run it

```bash
npm install
cp .env.example .env.local   # add your Binance MCP bearer token
npm run dev                  # http://localhost:3000
npm test                     # engine tests
npm run build                # production build
```

Get a token: connect any compatible agent (Claude Code, Codex, ChatGPT, VS Code) to the Binance MCP Server per the [official docs](https://developers.binance.com/en/docs/agent-native/mcp-server/agentic); the OAuth token is scoped to an isolated Agentic sub-account and can never withdraw.

## Rubric mapping (Track A workflow families)

- **Trading Workflows** (primary): Assay IS an automated trading action, the guardrail kind: resize, block, halt with reasons.
- **Data & Analysis** (secondary): the Docket: every fill or verdict becomes an analysis card with entry, price context, rule citation, transcript hash.
- Agent OS centrality: the Binance MCP Server is the only market/account channel; remove it and Assay has nothing to check.

## Credit

Built by Raphie (@a_raphie). Sep 2026.
