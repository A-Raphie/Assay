import { NextRequest, NextResponse } from "next/server";
import { parseTranscriptJsonl } from "@/mcp/replay";
import { check, type DayContext, type Order } from "@/engine/rules";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Curl-able proof: judge any order against the committed transcript's real
 * recorded price, same engine as the desk.
 * GET /api/verdict?symbol=BTCUSDT&notional=50
 *
 * NOTE: intentionally dynamic; searchParams select the judged order, so this
 * route must never be force-static (a static prerender would answer every
 * query with the build-time defaults).
 */

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const symbol = (sp.get("symbol") ?? "BTCUSDT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
  const parsedNotional = Number(sp.get("notional") ?? 50);
  if (!Number.isFinite(parsedNotional) || parsedNotional <= 0) {
    return NextResponse.json({ error: "notional must be a positive number" }, { status: 400 });
  }
  const notional = Math.min(1_000_000, parsedNotional);
  const maxTradePct = Math.min(100, Math.max(0.1, Number(sp.get("maxTradePct") ?? 2) || 2));
  const paperEquity = 1000;

  try {
    const jsonl = readFileSync(join(process.cwd(), "src/data/replay/baseline.jsonl"), "utf8");
    const frames = parseTranscriptJsonl(jsonl);
    const frame = frames.find((f) => f.tool === "spot.ticker24hr" && f.argsJson.includes(symbol));
    if (!frame) {
      return NextResponse.json(
        { error: `no recorded ticker for ${symbol}; recorded symbols: BTCUSDT, DOGEUSDT` },
        { status: 404 },
      );
    }
    if (!frame.verified) {
      return NextResponse.json({ error: "transcript hash verification failed" }, { status: 500 });
    }
    const response = JSON.parse(frame.responseJson);
    const payload =
      response.result?.structuredContent ?? JSON.parse(response.result?.content?.[0]?.text ?? "{}");
    const price = Number(payload.lastPrice);
    const ctx: DayContext = { equityStartOfDay: paperEquity, equityNow: paperEquity };
    const order: Order = {
      symbol,
      side: "BUY",
      type: "MARKET",
      quantity: price > 0 ? notional / price : 0,
      notional,
      source: "REPLAY",
    };
    const verdict = check(order, { maxTradePct, dailyHaltPct: 5, allowlist: ["BTC", "ETH", "BNB"] }, ctx);
    return NextResponse.json({
      requested: { symbol, notional, rules: { maxTradePct, dailyHaltPct: 5, allowlist: ["BTC", "ETH", "BNB"] } },
      market: { source: "recorded MCP transcript", price: String(price), change24hPct: payload.priceChangePercent ?? null, responseSha256: frame.responseSha256 },
      paperEquity,
      verdict,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "verdict failed" }, { status: 500 });
  }
}
