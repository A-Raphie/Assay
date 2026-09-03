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
