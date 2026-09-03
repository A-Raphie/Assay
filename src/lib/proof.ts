/**
 * Server-side helper: produce a REAL docket verdict from the committed
 * transcript for the landing page proof card. Same engine, same data path
 * as the desk's REPLAY mode. No fake values.
 */

import { parseTranscriptJsonl } from "@/mcp/replay";
import { check, type DayContext, type Order, type Verdict } from "@/engine/rules";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface ProofCard {
  verdict: Verdict;
  order: Order;
  price: { symbol: string; lastPrice: string; changePct: string };
  transcriptHash: string;
}

export function heroProof(): ProofCard | null {
  try {
    const jsonl = readFileSync(join(process.cwd(), "src/data/replay/baseline.jsonl"), "utf8");
    const frames = parseTranscriptJsonl(jsonl);
    const frame = frames.find((f) => f.tool === "spot.ticker24hr" && f.argsJson.includes("BTCUSDT"));
    if (!frame || !frame.verified) return null;
    const response = JSON.parse(frame.responseJson);
    const payload =
      response.result?.structuredContent ??
      JSON.parse(response.result?.content?.[0]?.text ?? "{}");
    const price = Number(payload.lastPrice);
    const paperEquity = 1000;
    const ctx: DayContext = { equityStartOfDay: paperEquity, equityNow: paperEquity };
    const notional = 50;
    const order: Order = {
      symbol: "BTCUSDT",
      side: "BUY",
      type: "MARKET",
      quantity: price > 0 ? notional / price : 0,
      notional,
      source: "REPLAY",
    };
    const rules = { maxTradePct: 2, dailyHaltPct: 5, allowlist: ["BTC", "ETH", "BNB"] };
    return {
      verdict: check(order, rules, ctx),
      order,
      price: { symbol: "BTCUSDT", lastPrice: String(price), changePct: String(payload.priceChangePercent ?? "") },
      transcriptHash: frame.responseSha256,
    };
  } catch {
    return null;
  }
}
