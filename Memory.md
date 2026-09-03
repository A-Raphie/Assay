# Assay — Memory

Running log of decisions, conventions, and gotchas. Newest at the top. One line per entry where possible.

## Decisions
- **2026-09-03** — Name: Assay (naming skill, full fidelity), ALWAYS capital A in brand surfaces (his hard rule after the lowercase misread). Real word, metallurgy test of metal; hook: "This is Assay, the check every Binance agent order must pass." Availability: GitHub free, npm assaykit free, tryassay.app free; X assay/assayapp taken; assay.finance unrelated fintech (accepted, repo-level naming).
- **2026-09-03** — Dual mode LIVE + REPLAY sharing one engine. Reason: KYC timing is the top schedule risk; replay of hash-stamped real transcripts is mock-hunter-safe and deterministic on camera.
- **2026-09-03** — Spot-only rules v1. Reason: leverage/liquidation semantics break the 2%/5% model; honesty over coverage.
- **2026-09-03** — Static Bearer token from Codex OAuth (keychain) instead of client-side OAuth. Reason: Binance rejects dynamic client registration; ZCode MCP probe also times out (3-step handshake ~2.9s each vs 5s probe). Direct JSON-RPC works.
- **2026-09-03** — Optimize for Agent OS centrality + 4 published workflow families (Trading primary, Data & Analysis secondary); judging weights confirmed unpublished by recon.
- **2026-09-03** — Fresh build, no Tape/Purser fork (Raphie's call); caps/receipts learnings carry over as knowledge only.

## Conventions
- No em dash in any UI string, README, or doc (hard rule). Use `·` for pairs, `:` for headings.
- Public credit: "Raphie" only, never full name.
- Every displayed value must trace to a real MCP response or a hash-stamped transcript entry (mock-hunter rule).
- English-only; no Chinese anywhere in the transcript.

## Gotchas
- Binance MCP: 50 tools via tools/list; `tool_search` requires `category` param; `tool_execute` wraps real API tools (spot.ticker24hr, spot.exchangeInfo, spot.getAccount, spot.newOrder, convert.*). Handshake takes ~2.9s per step; client timeouts must exceed 3s per call.
- Spot minimums: 5 USDC on majors (BTC/ETH/BNB/SOL/XRP/ADA); 1 USDC on DOGEUSDT/BONKUSDT and ~62 pairs; futures USDM floor 5 USDT (BTC perp is 50); convert USDT→DOGE floor 0.01.
- Track B requires all three legs (Spot + Futures + Margins-or-Convert), not one trade; first 10,000 × 4 USDC.
- The MCP account is an isolated Agentic sub-account; agent cannot pull from main, no withdrawal scope exists.
- Codex CLI usage limit hit until Sep 11 — Codex host cannot run demo; ZCode talks MCP directly via JSON-RPC.

## Things to not forget
- Brand-token mining before any UI code (frontend-first hard rule); DESIGN_LEDGER check: must differ from Rushes paper-amber, Purser dark-treasurer, Hansei light-journal.
- Hackathon-design banned default: dark dashboard, purple gradient, bento, chat panel, "Powered by" footer.
- Docket cards must show transcript hashes; REPLAY mode must be visibly labeled REPLAY.
- Survey: https://app.binance.com/uni-qr/user-survey/2913aa200aac462c89a737779393f3d4 — submit even if late-stage.
