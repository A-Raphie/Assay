# Assay — Design

The source of truth for the frontend. Every screen defers to this file; deviations update this file, not just the code.

## Feel
Precision — measured, metallic, decisive. A hallmark stamp, not an alarm.

## Audience
Binance judges and MCP-connected traders. They expect trading infrastructure to feel exact: numbers first, decoration never, trust earned through visible provenance (hashes, timestamps, rule citations).

## Visual direction
Axis divergence (2.5 of 6 pushed), wearing Binance's real dark theme mined from live CSS (verified Sep 4 against binance.com/agent-os runtime theme + static bundles). Font note: page computes to `BinanceNova, Arial, sans-serif`; BinanceNova is proprietary, so we self-host Geist Sans + Geist Mono (closest kin, FOUT-safe).
- **Color strategy (pushed):** Binance-black base in their exact vessel/card ladder, sponsor yellow as the single accent (their two-yellow system: `#F0B90B` brand + `#FCD535` action-on-dark), desaturated Binance trading green/red reserved strictly for PASS/BLOCK semantics on proof cards. No purple, no gradient.
- **Layout paradigm (pushed):** document/ledger metaphor for the Docket: each verdict is a numbered certificate entry (serial, timestamp, transcript hash), stacked like assay office records. No dashboard bento.
- **Elevation (half push):** hairlines only (`#333B47` ladder), no glow, no soft shadows. One exception: the stamp moment may use a single hard offset shadow at strike time.
- **Typography / Density / Motion:** convention. BinanceNova is theirs; we ship Geist Sans + Geist Mono (close kin, self-hosted, no FOUT) at their sizes. Dense where data, generous around the verdict. Stillness; motion only at the stamp.

## Design tokens (mined from binance.com live theme, Sep 4)
- `--bg: #181A20` (BasicBg) · `--panel: #202630` (CardBg) · `--vessel: #29313D` · `--line: #333B47` (hairlines) · `--ink: #EAECEF` (PrimaryText) · `--ink-2: #929AA5` · `--ink-3: #707A8A` · `--accent: #F0B90B` (PrimaryYellow/brand, links) · `--accent-bright: #FCD535` (BtnBg, action surfaces) · `--on-accent: #202630` (TextOnYellow) · `--pass: #2EBD85` (Buy/Success) · `--deny: #F6465D` (Sell/Error) · `--mono: Geist Mono` for hashes/serials · radius 4px (their button radius) cards / 2px stamps · spacing 4-base · type 12/14/18/28/56, hero verdict numerals 56/700 tabular-nums.

## Copy tone
Plain, verb-first, zero jargon on the front door. Verdicts cite the rule in the user's own words. Two reference lines:
- Blocked card: "Blocked · Rule 3: BTC, ETH, BNB only · 1000CATUSDT is not on your allowlist."
- Resized card: "Resized · Rule 1: max 2% per trade · 100 USDC cut to 2 USDC."

## User flow
1. **Front door** — "This is Assay, the check every Binance agent order must pass." One screen: what it does in 2 sentences, the 3 rules as a live spec strip, hash-stamped sample card, Enter path. Visible proof: a real REPLAY verdict card rendering in place.
2. **Rules** — 3 controls (max % per trade, daily halt %, allowlist chips), saves to localStorage, shows effective config as a stamp plate.
3. **Desk (activity feed)** — propose order (LIVE form or REPLAY run), feed of Docket cards in 4 states, each with serial, rule citation, transcript hash, and for fills: entry, fee, what-to-watch.

## Folds used
- (empty on scaffold)

## Avoid-list
- Dark dashboard with purple/blue gradient; bento stat grids; glassmorphic cards.
- AI chat panel as the centerpiece; single decorative chart; emoji icons.
- "Powered by Binance" footer phrasing; sponsor logo top-left in the borrowed way.
- Glow, soft shadows, floating orbs; neon cyberdelia.
- Any displayed number that is not traceable to a real MCP response or hash-stamped transcript (mock-hunter).
- em dashes in copy (hard rule); raw hex colors in components (semantic tokens only).
