# Assay — PRD

## Problem
Binance Agent OS just made one-click MCP trading real: any AI agent (Claude Code, Codex, ChatGPT, VS Code) can now place Spot, Margin, Convert, and Futures orders against a funded Agentic sub-account with a single authorized connection. What it did not ship is any pre-trade check. A hallucinated symbol, a wrong decimal, or a YOLO prompt converts straight into a real order against real funds. The first wave of MCP-connected traders is one bad prompt away from a blown sub-account, and there is no human-readable layer between the agent's intent and the exchange.

## Personas
- **Primary: the MCP-connected trader (Raphie as archetype)** — wires an AI agent to Binance via MCP, wants the agent to act but not to act *unboundedly*. Today's workaround: scope-minimal grants plus prayer. No tool shows "this order was cut to 2% because of your rule" in plain language.
- **Secondary: hackathon judges / Binance ecosystem devs** — evaluating whether Agent OS is safe to build on; they need to see the guardrail work in seconds, deterministically.

## Jobs to be Done
1. When my agent proposes an order, I want it checked against my rules before it reaches Binance, so I can let the agent run without watching it.
2. When a rule fires, I want the order resized or blocked with the exact reason cited, so I trust the system instead of auditing it.
3. When a fill comes back, I want a plain-language proof card (entry, fee, reason, what to watch), so I can verify the agent's work in seconds.

## Scope (v1)
- Rules engine: max percent per trade (default 2%), daily loss halt (default 5%), symbol allowlist (default BTC/ETH/BNB). Spot only.
- Two modes sharing one engine: **LIVE** (orders through the Binance MCP Server at agent.binance.com/mcp/agentic against the Agentic sub-account) and **REPLAY** (the same engine against a recorded, dated, hash-stamped MCP transcript; clearly labeled REPLAY, never fake values).
- Docket: proof cards per fill from real MCP outputs (passed / resized / blocked / halt states).
- Next.js front door: what-it-is screen, rules form, activity feed.

## Non-goals
- No Margin, no Futures, no Convert in v1's rule coverage (Spot only).
- No multi-user accounts, no auth, no cloud sync — rules live in local storage for v1.
- No backtesting framework, no strategy signals, no exchange abstraction beyond Binance.
- Not a custody product: Assay never holds keys; it rides the MCP authorization model.

## Success metrics
- Leading: a YOLO prompt ("put everything in DOGE") produces a resized order citing the rule, visible in under 20 seconds on screen.
- Leading: 4 card states (passed, resized, blocked, halt) all renderable from real MCP output in the demo video.
- Lagging: Track A placement (53 paid slots); target a paid slot, stretch top-3.

## Kill criteria
- If the MCP transcript recorder cannot capture deterministic, hash-verifiable transcripts by end of Sep 5, drop LIVE mode and ship REPLAY-only with the recorded transcript (still real data, clearly labeled).
- If no verified Binance account by Sep 6 evening, REPLAY mode is the demo; Track B is abandoned without blocking Track A.

## Open questions
- [assumption: judging weights unpublished — optimize for Agent OS centrality + the four published workflow families (Trading Workflows primary, Data & Analysis secondary)]
- [to fill: demo host final pick — Codex CLI is wired; Claude Code as fallback]
