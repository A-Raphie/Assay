/**
 * Recorded-free live klines proxy for the sparkline: real closes from the
 * Binance MCP. GET /api/klines?symbol=BTCUSDT&interval=1h&limit=24
 */

import { BinanceMcp } from "@/mcp/binance";

export const revalidate = 60;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const symbol = (sp.get("symbol") ?? "BTCUSDT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
  const interval = ["1h", "4h", "15m", "30m", "1d"].includes(sp.get("interval") ?? "1h")
    ? (sp.get("interval") ?? "1h")
    : "1h";
  const limit = Math.min(48, Math.max(6, Number(sp.get("limit") ?? 24) || 24));
  try {
    const client = new BinanceMcp(process.env.BINANCE_MCP_TOKEN ?? "");
    await client.initialize();
    const k = await client.execute("spot.klines", { symbol, interval, limit });
    const rows = Array.isArray(k.structured) ? k.structured : [];
    const closes = rows.map((r: any[]) => Number(r[4])).filter((n: number) => Number.isFinite(n));
    return Response.json({ ok: true, symbol, interval, closes });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "klines failed" },
      { status: 502 },
    );
  }
}
