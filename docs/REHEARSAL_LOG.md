# Ship rehearsal log — release/submission → main (Sep 4, 2026)

Path: branch → preview deploy → E2E as real user → CLI-QA → merge → prod deploy → gate.

## Environment findings (the point of the rehearsal)
1. Preview deployments were SSO-protected (every anonymous request hit "Redirecting..."). Fixed: project ssoProtection=null via `vercel api /v9/projects/tryassay --method PATCH -F 'ssoProtection=null'`.
2. Preview environment had no BINANCE_MCP_TOKEN (env vars are per-environment; production-only). Symptom: /api/ticker 502→401 while /api/verdict stayed green (verdict reads the committed transcript, no live call). Fixed: env created via REST API scoped to Preview + gitBranch release/submission (CLI interactive branch prompt cannot be piped).
3. First harness run vs stale preview URL produced 17 false failures — always QA the deployment you just built, not a previous one.

## CLI-QA (scripts/qa.mjs, stays in repo)
- Subcommands: verdict / ticker / share / pages / smoke / edge / all.
- Final: 30/30 clean against the branch preview. Caught + fixed en route: negative-notional accepted as an empty PASS (now a 400), hostile symbol handling documented (sanitize, don't reject: BTCUSDT🚀 → BTCUSDT).

## E2E (real browser on the preview)
- Cold load: live price rendered, strip + wordmark present, no console blockers.
- Judge flow: YOLO → BLOCK stamp, hero RESIZE proof, entry sha256 shown.
- LIVE arm gate renders confirmation; arming is two-step.
- Mobile 375: no horizontal overflow, docket-first order.
- 404 + malformed /d/ links: branded verdict pages.

## Gate
- main deployed to production (tryassay.vercel.app), live /api/verdict returns BLOCK for the canonical YOLO case, brand present. Lighthouse on final: P99 / A100 / BP100 / SEO100, CLS 0.001, LCP 1.6s.

## Final audit round (Sep 4 night) — third full re-run
- Isolated reviewer (fresh eyes, current build): 29/40 Good-bottom. Real catches: "oversized" lowercase still live (scripted fix had silently missed the wrapped line — lesson: verify replace matched, assert), nav membership drifted per page, number formats drifted, FAQ measure. Fixed all; nav now consistent (try/desk/rules everywhere incl. strip + footer).
- Test-data artifact flagged as "contradiction": desk rules showed 3%/0.3% — that was MY audit browser localStorage, not shipped defaults (2%/5% everywhere for fresh visitors). Reviewers audit the browser you give them; clean it before they look.
- Hero copy rewritten on his verdict: "keys" line was a custody story Assay doesn't own → "Your agent places the trade. Your rules make the call." Subhead cut from spec-dump to mechanism + payoff.
- Final Lighthouse: P99 / A100 / BP100 / SEO100, CLS 0, LCP 2.0s.

## Claims-verify sweep (Sep 4 night, current revision 3d9734a)
- "cycles every 4s" — timed at ~4.0-4.2s intervals across a full cycle: TRUE.
- "judged on every order" / "re-judged live" — verified: every asset switch re-fetches /api/verdict?live=1 and the card re-renders with a fresh sha256: TRUE.
- "blocked orders never reach Binance" — verified structurally: verdict endpoints stop before spot.newOrder; execution stays gated: TRUE.
- "no keys / no custody" — verified: no key storage in repo, no withdrawal scope in the Binance MCP model: TRUE.
- Config snippet — /api/mcp answers initialize, tools/list, tools/call (assay_check) in JSON-RPC: TRUE (37/37 incl. mcp checks).
- Link claims — /try, /desk, /rules, /#connect, /d/ valid + malformed: all land on the promised section/state: TRUE.
