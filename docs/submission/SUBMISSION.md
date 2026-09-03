# Assay: submission package

Event: Binance Agent OS Mini Hackathon · Track A
Deadline: Sep 8, 2026 23:59 UTC
Entry: follow @Binance + repost the announcement, reply or quote with video/demo + GitHub, complete the survey.

## OVERVIEW

Assay is the pre-trade check for Binance Agent OS. AI agents connected through the Binance MCP Server can place real orders on your Agentic sub-account, but nothing checks them first. Assay does: orders are priced against the real book and judged against three user rules (max percent per trade, daily loss halt, symbol allowlist). Oversized orders are resized, forbidden symbols are blocked, red days halt everything, and every verdict cites its rule in plain words with the transcript hash attached.

One engine, two modes: LIVE (real MCP reads against your sub-account) and REPLAY (the same engine over hash-verified recorded transcripts, deterministic for judging).

Links:
- Live: https://tryassay.vercel.app
- Repo: https://github.com/A-Raphie/assay
- Video: [to add after final cut]

## FORM-ANSWERS (drafts)

What is your project in one sentence?
: assay checks every AI agent order against your rules before it reaches the Binance MCP Server, and gives you a plain-language verdict with proof attached.

What does it use from Agent OS?
: The Binance MCP Server (agent.binance.com/mcp/agentic) for market data, account reads, and (gated) trade execution, plus the Agentic sub-account permission model. It is the only channel assay uses: remove Agent OS and Assay has nothing to check.

Which Track A workflow family does it belong to?
: Trading Workflows (signals, strategies, automated actions), with Data & Analysis as a second family (the Docket proof cards analyze every verdict and fill).

What is the demo?
: Under 90 seconds: YOLO order blocked on the allowlist rule, same-size order resized to the 2% cap with strikethrough, red-day halt overriding everything, then LIVE mode reading the real ticker and real sub-account through the MCP. Every card carries a sha256 of the real MCP response.

Is execution live?
: Deliberately gated. The engine judges real orders against the real account; the final execute call stays behind an explicit opt-in. A safety product does not auto-fire in a demo.

## JUDGING-MATRIX

| Criterion (as published) | Where assay scores |
|---|---|
| Agent OS centrality | MCP Server is the only data/account channel; Agentic sub-account model is respected (no withdrawals, scoped token) |
| Track A: Trading Workflows | The product IS an automated trading action: pre-trade check with resize/block/halt |
| Track A: Data & Analysis | Docket cards: entry, real price context, rule citation, transcript hash |
| Working product | Deployed, engine tested (11 tests), LIVE + REPLAY both real |
| Judge experience | 90-second path, no login, deterministic REPLAY, hashes verifiable |
| Honest disclosure | README honesty table; zero balances rendered as zero; REPLAY labeled and declared |

## X_POST (draft; run through humaniser before posting)

found a hole in Agent OS: one prompt can move your whole sub-account.
so i built assay: the check every agent order has to pass.
orders over your cap get cut. off-list symbols get blocked. red days halt everything.
every verdict cites the rule and carries the hash of the real MCP response.
built on the Binance MCP Server, live here: [link] · repo: [link]
#BinanceAgentOS

## SUBMISSION CHECKLIST

- [ ] Follow @Binance + repost announcement (do from @a_raphie)
- [ ] Record video after VO exists (vo-first rule: no takes before audio)
- [ ] Quote-repost with video + GitHub link
- [ ] Complete survey: https://app.binance.com/uni-qr/user-survey/2913aa200aac462c89a737779393f3d4
- [ ] Verify all links incognito
- [ ] Keep links alive through the judging window
