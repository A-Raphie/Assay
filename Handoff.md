# Assay — Handoff

Read this first if you're picking up the project. Mirrors current state; updated as work progresses.

## Current state
Spec scaffold day (Sep 4 evening). Repo locked at github.com/A-Raphie/assay, six spec files written, no code yet. Design direction brief and brand-token mining are the next concrete outputs; then the rules engine.

## What's done
- Idea validated through the skills battery (idea-autopsy SURVIVED, before-you-build, playbook fit: 53 paid slots, high density).
- Binance MCP connection proven: direct JSON-RPC with Bearer token (keychain: Codex MCP Credentials), BTCUSDT ticker + account reads working.
- Name locked (Assay), availability swept, repo created.
- Track B requirements mapped (3 legs, ~8 USDC) and parked pending KYC.

## In progress
- design.md: needs brand-token mining from binance.com CSS + hackathon-design direction brief (Phases 2–6).

## Blocked / waiting
- LIVE mode end-to-end test — blocked on Raphie's Binance KYC verification (register page in progress Sep 4).
- Demo host final pick — Codex CLI rate-limited until Sep 11; ZCode direct JSON-RPC is the working path; Claude Code optional.

## How to run it
```bash
# not yet applicable — no app scaffold. After Phase 1:
npm install
npm run dev
npx vitest            # engine tests
```

## Next steps
1. Mine Binance brand tokens (curl binance.com + agent-os page CSS, grep custom properties) → fill design.md.
2. Run hackathon-design Phases 2–6 → direction brief into design.md.
3. Scaffold Next.js app; engine + tests first (Tasks Phase 1).

## Open questions
- Final demo host on camera: ZCode direct MCP (proven) vs Claude Code (untested here).
- Domain: tryassay.app free; register only if the front door wants a vanity URL.

## Pointers
- Spec: [PRD.md](./PRD.md) · [Architecture.md](./Architecture.md)
- Plan: [Tasks.md](./Tasks.md)
- History: [Memory.md](./Memory.md)
