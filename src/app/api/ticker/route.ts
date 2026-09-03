/**
 * Live market proxy: real Binance MCP read, cached at the edge for 20s.
 * GET /api/ticker?symbol=BTCUSDT
 */

import { BinanceMcp } from "@/mcp/binance";

export const revalidate = 20;

export async function GET(req: Request) {
  const symbol = (new URL(req.url).searchParams.get("symbol") ?? "BTCUSDT")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20);
  const token = process.env.BINANCE_MCP_TOKEN ?? "";
  try {
    const client = new BinanceMcp(token);
    await client.initialize();
    const t = await client.execute("spot.ticker24hr", { symbol });
    return Response.json({
      ok: true,
      symbol,
      lastPrice: String(t.structured.lastPrice),
      openPrice: String(t.structured.openPrice),
      changePct: String(t.structured.priceChangePercent),
      high: String(t.structured.highPrice),
      low: String(t.structured.lowPrice),
      at: new Date().toISOString(),
      live: Boolean(token),
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "ticker failed" },
      { status: 502 },
    );
  }
}
