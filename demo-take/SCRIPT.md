# Assay — Demo Script (60s cut)
**Hackathon:** Binance Agent OS Mini Hackathon, Track A
**Time limit:** 60s target (pacing tool default; hard stop 90s)
**Judging:** unpublished — optimizing for the only published signals: Agent OS centrality, Trading Workflows + Data & Analysis families, working product, judge experience
**One message:** "Assay is the check your agent's orders must pass before Binance ever sees them."

**Setup:** Chrome 1440×900 on tryassay.vercel.app, drawn cursor overlay with visible clicks, no wallet needed (REPLAY mode is wallet-free), live MCP ticker on screen. VO = Raphie's audio only (vo-first rule).

### Scene 1: Hook (0:00–0:08)
**Criterion:** Hook / Product
**Show:** Landing hero. Live BTC price ticking on the right, stamped glance card under it: RESIZE · 50 → 20 USDC.
**Say:** "You just wired an AI agent to Binance. One bad prompt, and it spends everything. Assay is the check that stands between them."
**Action:** Hold on hero. No scroll yet. Let the price tick once on camera.

### Scene 2: Judge an order live (0:08–0:22)
**Criterion:** Product + Trading Workflows
**Show:** /try. Click the DOGE quick-pick: BLOCK stamp lands, red, with the rule citation.
**Say:** "Here's the whole product in one click. A thousand dollars into Dogecoin: blocked. Rule three, the allowlist. The order never reaches Binance."
**Action:** Click DOGE · 1,000 quick-pick. Let the stamp animation land. Pause on the card.

### Scene 3: The cut (0:22–0:34)
**Criterion:** Product + Trading Workflows
**Show:** Click BTC · 50: RESIZE stamp, strikethrough 50 → 20.
**Say:** "Same agent, honest trade. Fifty dollars of Bitcoin, over the two percent cap: resized to twenty. The rule that fired is written right on the card."
**Action:** Click BTC · 50 quick-pick. Hold on the strikethrough.

### Scene 4: Proof, not promises (0:34–0:46)
**Criterion:** Data & Analysis + Trust
**Show:** Point at the sha256 line on the card, then the strip: LIVE FEED · BINANCE MCP SERVER.
**Say:** "Every verdict carries the hash of the real market response it judged. Not a promise. A receipt."
**Action:** Slow cursor trace along the hash line. Hold.

### Scene 5: Close (0:46–0:58)
**Criterion:** Agent OS centrality + links
**Show:** GitHub + live URL on screen.
**Say:** "Assay: your agent places the trade, your rules make the call. App and source are on screen now."
**Action:** Hold both links for 5 seconds.

---

**Time budget:**
| Beat | Allocated | Scenes |
|------|-----------|--------|
| Hook + product | 34s | 1, 2, 3 |
| Trust/proof | 12s | 4 |
| Close/links | 12s | 5 |
| **Total** | **0:58** | |

**Submission checklist:**
- [x] Live URL shown: tryassay.vercel.app
- [x] GitHub shown: github.com/A-Raphie/Assay
- [x] No mock data: judge box uses live prices; hero card uses hash-verified recorded transcript
- [x] Opens on landing, hook in first sentence
- [x] One message: the check before the order

---

# vo.txt (TTS-ready, paste into engine)

```
You just wired an AI agent to Binance. One bad prompt, and it spends everything. Assay is the check that stands between them.

Here's the whole product in one click. A thousand dollars into Dogecoin: blocked. Rule three, the allowlist. The order never reaches Binance.

Same agent, honest trade. Fifty dollars of Bitcoin, over the two percent cap: resized to twenty. The rule that fired is written right on the card.

Every verdict carries the hash of the real market response it judged. Not a promise. A receipt.

Assay: your agent places the trade, your rules make the call. App and source are on screen now.
```

---

**Audit status:** written to tts-ready rules during drafting (no digits, no hashes, no URLs in VO — "a thousand dollars" and "fifty dollars" spoken-form; hashes stay on screen). Run the grep audit + read-aloud before engine. VO gated on Raphie's audio (vo-first): no takes before his voice exists.
