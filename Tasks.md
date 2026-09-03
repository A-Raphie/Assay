# Assay — Tasks

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Phase 0 — Foundations (Sep 4 evening)
- [x] Lock repo github.com/A-Raphie/assay — done when remote exists and main branch pushed
- [ ] Spec scaffold committed (PRD, Architecture, Tasks, Memory, Handoff, design.md) — done when all six files pushed
- [ ] Brand-token mining from binance.com + Agent OS page CSS — done when token block exists in design.md with mined hexes
- [ ] Direction brief via hackathon-design Phases 2–6 — done when design.md carries banned default, axes, signature move, avoid-list

## Phase 1 — MVP (Sep 5)
- [ ] Rules engine `assay.check` + unit tests (PASS/RESIZE/BLOCK/HALT) — depends on Phase 0 — done when 4 verdict cases pass in vitest
- [ ] MCP client: initialize handshake, tool_search, tool_execute (spot.ticker24hr first) — done when live BTCUSDT ticker renders in app
- [ ] Transcript recorder (JSONL + sha256 per exchange) — done when transcript file shows hash-verified entries
- [ ] REPLAY mode reading a recorded transcript through the same engine — done when a recorded YOLO order produces RESIZE verdict identically in both modes
- [ ] Rules form (3 rules, localStorage) — done when rules persist across reload

## Phase 2 — v1 (Sep 6)
- [ ] Activity feed + Docket cards, 4 states (passed/resized/blocked/halt) — done when all 4 render from real MCP output
- [ ] Signature stamp moment (resize/block animation on the card) — done when it appears in a screen recording
- [ ] State coverage: empty, populated, offline/error, mobile — done when all 4 audited in browser
- [ ] LIVE spot order end-to-end (if KYC landed): 5 USDC BTC or REPLAY-only demo locked — done when demo path chosen

## Phase 3 — Ship (Sep 7)
- [ ] Audit battery: ui-craft sequence, ui-ux-audit, mock-hunter on every displayed value — done when findings fixed and re-verified
- [ ] demo-script → vo-first → 60–90s video — done when final cut approved by Raphie
- [ ] README with honesty table + 90-second judge path — done when every claim checkable in one click
- [ ] docs/submission package (rubric mapping to 4 workflow families, form answers, X post draft) — done when package complete

## Phase 4 — Submit (Sep 8)
- [ ] X reply/quote with video + GitHub link — done when posted from @a_raphie
- [ ] Survey submitted — done when confirmation saved
- [ ] Track B (only if KYC lands by Sep 6 evening): Spot 1 USDC DOGE + Futures 5 USDT + Convert 0.01, ~8 USDC total — done when 3 trade IDs saved
- [ ] Keep-alive: links checked daily through judging window

## Dependencies
- Phase 1 engine before modes; modes before feed cards; Phase 2 states before audit; audit before video; video before submit.
- KYC is parallel and non-blocking (REPLAY is the fallback).

## Done = video posted as X reply + survey submitted + repo public with live Vercel URL, all before Sep 8 23:59 UTC.
