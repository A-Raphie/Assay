# Assay — Architecture

## Overview
Assay is a Next.js application plus a TypeScript rules engine that sits between an AI agent and the Binance MCP Server. Orders proposed by the agent are evaluated against user rules; passing orders execute through the MCP, oversized ones are resized, forbidden ones are blocked, and every outcome renders as a Docket proof card. A transcript recorder captures real MCP exchanges (dated, hashed) so REPLAY mode can re-run the identical engine against real market data without a live session.

## Components
- **Rules engine (`engine/`)** — pure TypeScript, zero I/O. Input: proposed order (symbol, side, quantity, notional) + rules + day PnL context. Output: verdict object (PASS / RESIZE with adjusted quantity / BLOCK with rule citation / HALT). Deterministic and unit-testable; the same code path serves both modes.
- **MCP client (`mcp/`)** — JSON-RPC 2.0 over HTTP to `https://agent.binance.com/mcp/agentic`, Bearer token auth (OAuth via Codex client_id handshake, token in macOS keychain). Tools used: `tool_search`, `tool_execute` wrapping `spot.ticker24hr`, `spot.exchangeInfo`, `spot.getAccount`, `spot.newOrder`, `convert.*`. Every request/response pair is appended to the transcript store.
- **Transcript recorder (`mcp/transcript.ts`)** — append-only JSONL: {ts, tool, args, response hash (sha256), response}. REPLAY mode reads a transcript and feeds recorded responses to the engine in order. Hashes render in the UI so judges can verify the data is real.
- **Web app (`app/`)** — Next.js (App Router) + Tailwind. Screens: front door (what/why + Enter), rules form, activity feed with live Docket cards. State via local storage + server actions; no external DB.

## Data model
- `RuleSet { maxTradePct: number; dailyHaltPct: number; allowlist: string[] }` — persisted to localStorage, versioned.
- `Order { symbol, side, type, quantity, notional, source: LIVE|REPLAY }`
- `Verdict { action: PASS|RESIZE|BLOCK|HALT, rule?: string, adjustedNotional?: number, reason: string, orderId?: string }`
- `TranscriptEntry { ts, tool, argsJson, responseSha256, responseJson }` — JSONL file per session.

## Tech stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 15 + Tailwind | Raphie's strongest stack; Vercel-native |
| Engine | Pure TS functions | Shared LIVE/REPLAY, trivially testable |
| MCP link | Direct JSON-RPC over HTTP | Binance's MCP is streamable HTTP; no SDK needed |
| Hosting | Vercel | Claimcheck pattern; free, fast, public URL for judges |

## Key decisions & trade-offs
- **Static Bearer header from Codex OAuth token** instead of client-side OAuth — ZCode's MCP client fails dynamic client registration against Binance; the Codex-negotiated token (30-day expiry, scoped) is stored in the keychain and used server-side only. Trade-off: manual re-auth monthly; irrelevant for the hackathon window.
- **REPLAY mode as first-class** — demo risk (KYC timing) is the biggest schedule threat; a hash-stamped real transcript is mock-hunter-safe (no fake values) and deterministic on camera.
- **Spot-only rules** — futures/margin rule semantics (leverage, liquidation) do not fit the 2%/5% model; cutting them keeps the engine honest.
- **No DB** — localStorage rules + JSONL transcripts; nothing to deploy or leak.

## API surface (internal)
- `assay.check(order: Order, rules: RuleSet, ctx: DayContext): Verdict`
- `assay.execute(verdict): Promise<TranscriptEntry>` (LIVE only)
- `assay.replay(transcriptPath): SessionResult`
- Server actions: `submitRules`, `proposeOrder`, `runReplay`

## Open architectural questions
- [assumption: Binance MCP `spot.newOrder` accepts `quoteOrderQty` market buys — verify on first LIVE test]
- [to fill: transcript storage location under Vercel — likely `/tmp` per-invocation plus committed sample transcripts in-repo]
