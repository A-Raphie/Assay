"use server";

/**
 * Assay desk actions. LIVE actions talk to the Binance MCP Server directly;
 * REPLAY actions run the same engine over the committed, hash-verified
 * transcript. Every value shown on screen comes from one of these two paths.
 */

import { BinanceMcp } from "@/mcp/binance";
import { parseTranscriptJsonl } from "@/mcp/replay";
import { check, type DayContext, type Order, type RuleSet, type Verdict } from "@/engine/rules";
import { replayScenarios, type ReplayScenario } from "@/lib/scenarios";
import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: BinanceMcp | null = null;

function mcp(): BinanceMcp {
  const token = process.env.BINANCE_MCP_TOKEN ?? "";
  // stateless per invocation: serverless-safe, transcript returned to caller
  cached = new BinanceMcp(token);
  return cached;
}

export interface DeskResult {
  ok: boolean;
  error?: string;
  verdict?: Verdict;
  order?: Order;
  transcriptHash?: string;
  price?: { symbol: string; lastPrice: string; changePct: string };
  account?: { usdc: string; usdt: string; canTrade: boolean };
  executed?: boolean;
}

export async function liveContext(): Promise<DeskResult> {
  const client = mcp();
  if (!process.env.BINANCE_MCP_TOKEN) {
    return { ok: false, error: "Server has no Binance MCP token. Market reads still work." };
  }
  try {
    const [btc, account] = await Promise.all([
      client.execute("spot.ticker24hr", { symbol: "BTCUSDT" }),
      client.execute("spot.getAccount", {}),
    ]);
    const balances = account.structured.balances ?? [];
    const usdc = balances.find((b: any) => b.asset === "USDC")?.free ?? "0";
    const usdt = balances.find((b: any) => b.asset === "USDT")?.free ?? "0";
    return {
      ok: true,
      price: {
        symbol: "BTCUSDT",
        lastPrice: btc.structured.lastPrice,
        changePct: btc.structured.priceChangePercent,
      },
      account: { usdc, usdt, canTrade: Boolean(account.structured.canTrade) },
      transcriptHash: client.transcript.at(-1)?.responseSha256,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "MCP call failed" };
  }
}

export async function proposeLive(input: {
  symbol: string;
  side: "BUY" | "SELL";
  notional: number;
  rules: RuleSet;
}): Promise<DeskResult> {
  const client = mcp();
  if (!process.env.BINANCE_MCP_TOKEN) {
    return { ok: false, error: "Server has no Binance MCP token set." };
  }
  try {
    const sym = input.symbol.toUpperCase().trim();
    const ticker = await client.execute("spot.ticker24hr", { symbol: sym });
    const price = Number(ticker.structured.lastPrice);
    const account = await client.execute("spot.getAccount", {});
    const balances = account.structured.balances ?? [];
    const usdc = Number(balances.find((b: any) => b.asset === "USDC")?.free ?? "0");
    const usdt = Number(balances.find((b: any) => b.asset === "USDT")?.free ?? "0");
    const equityNow = usdc + usdt;
    const ctx: DayContext = { equityStartOfDay: equityNow, equityNow };
    const order: Order = {
      symbol: sym,
      side: input.side,
      type: "MARKET",
      quantity: price > 0 ? input.notional / price : 0,
      notional: input.notional,
      source: "LIVE",
    };
    const verdict = check(order, input.rules, ctx);
    return {
      ok: true,
      verdict,
      order,
      price: { symbol: sym, lastPrice: ticker.structured.lastPrice, changePct: ticker.structured.priceChangePercent },
      account: { usdc: String(usdc), usdt: String(usdt), canTrade: Boolean(account.structured.canTrade) },
      transcriptHash: client.transcript.at(-1)?.responseSha256,
    };
    // Execution (spot.newOrder) stays behind an explicit opt-in flag added in a
    // later task; this endpoint intentionally stops at the verdict + proof.
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "LIVE propose failed" };
  }
}

export async function replayScenario(
  scenarioId: string,
  rules: RuleSet,
): Promise<DeskResult> {
  const scenario = replayScenarios.find((s) => s.id === scenarioId);
  if (!scenario) return { ok: false, error: `Unknown scenario ${scenarioId}` };
  try {
    const jsonl = readFileSync(join(process.cwd(), "src/data/replay/baseline.jsonl"), "utf8");
    const frames = parseTranscriptJsonl(jsonl);
    const frame = frames.find((f) => f.tool === "spot.ticker24hr" && f.argsJson.includes(scenario.symbol));
    if (!frame) return { ok: false, error: `No recorded ticker for ${scenario.symbol}` };
    if (!frame.verified) return { ok: false, error: "Transcript hash verification failed" };
    const response = JSON.parse(frame.responseJson);
    const payload = response.result?.structuredContent ?? response.structuredContent ?? JSON.parse(response.result?.content?.[0]?.text ?? "{}");
    const price = Number(payload.lastPrice);
    const dayLoss = (scenario.paperDayLossPct / 100) * scenario.paperEquity;
    const ctx: DayContext = {
      equityStartOfDay: scenario.paperEquity,
      equityNow: scenario.paperEquity - dayLoss,
    };
    const order: Order = {
      symbol: scenario.symbol,
      side: scenario.side,
      type: "MARKET",
      quantity: price > 0 ? scenario.notional / price : 0,
      notional: scenario.notional,
      source: "REPLAY",
    };
    const verdict = check(order, rules, ctx);
    return {
      ok: true,
      verdict,
      order,
      price: { symbol: scenario.symbol, lastPrice: String(price), changePct: String(payload.priceChangePercent ?? "") },
      transcriptHash: frame.responseSha256,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "REPLAY failed" };
  }
}
