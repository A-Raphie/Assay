import { NextRequest, NextResponse } from "next/server";
import { parseTranscriptJsonl } from "@/mcp/replay";
import { check, type DayContext, type Order } from "@/engine/rules";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Assay's own MCP endpoint. Minimal streamable-HTTP JSON-RPC so any
 * MCP-speaking agent can add Assay as a server and call assay_check
 * before placing orders through the Binance MCP Server.
 *
 *   tools: assay_check(symbol, notional, maxTradePct?) -> verdict
 */

export const dynamic = "force-dynamic";

const PROTOCOL = "2025-06-18";
const SERVER = { name: "assay", title: "Assay: pre-trade checks", version: "0.1.0" };

const TOOLS = [
  {
    name: "assay_check",
    description:
      "Judge a proposed spot order against the user's three rules (per-trade cap, daily loss halt, allowlist) at the real recorded market price. Call this BEFORE placing any order via the Binance MCP Server. Returns PASS, RESIZE (with adjustedNotional), BLOCK, or HALT with the rule that fired.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Trading pair, e.g. BTCUSDT" },
        notional: { type: "number", description: "Order size in USDC" },
        maxTradePct: { type: "number", description: "Optional: per-trade cap percent (default 2)", default: 2 },
      },
      required: ["symbol", "notional"],
    },
  },
];

function judgeOrder(symbol: string, notional: number, maxTradePct: number) {
  const paperEquity = 1000;
  const jsonl = readFileSync(join(process.cwd(), "src/data/replay/baseline.jsonl"), "utf8");
  const frames = parseTranscriptJsonl(jsonl);
  const frame = frames.find((f) => f.tool === "spot.ticker24hr" && f.argsJson.includes(symbol));
  if (!frame || !frame.verified) {
    return { error: `no verified recorded price for ${symbol}; recorded: BTCUSDT, DOGEUSDT` };
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
  return {
    symbol,
    notional,
    price: String(price),
    priceSource: "recorded mcp transcript",
    responseSha256: frame.responseSha256,
    verdict,
  };
}

function rpcResult(id: number | null, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result }, { status: 200 });
}

function rpcError(id: number | null, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 200 });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }, { status: 400 });
  }

  const { id, method, params } = body ?? {};

  switch (method) {
    case "initialize":
      return rpcResult(id ?? null, {
        protocolVersion: PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return new NextResponse(null, { status: 202 });
    case "tools/list":
      return rpcResult(id ?? null, { tools: TOOLS });
    case "tools/call": {
      const name = params?.name;
      const args = params?.arguments ?? {};
      if (name !== "assay_check") {
        return rpcError(id ?? null, -32602, `unknown tool: ${name}`);
      }
      const symbol = String(args.symbol ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
      const notional = Number(args.notional);
      if (!symbol) return rpcError(id ?? null, -32602, "symbol is required");
      if (!Number.isFinite(notional) || notional <= 0) return rpcError(id ?? null, -32602, "notional must be a positive number");
      const maxTradePct = Math.min(100, Math.max(0.1, Number(args.maxTradePct ?? 2) || 2));
      const judged = judgeOrder(symbol, Math.min(1_000_000, notional), maxTradePct);
      if ("error" in judged) {
        return rpcResult(id ?? null, {
          content: [{ type: "text", text: judged.error }],
          isError: true,
        });
      }
      return rpcResult(id ?? null, {
        content: [
          {
            type: "text",
            text: `${judged.verdict.action}: ${judged.verdict.citation ?? "within rules"} · ${judged.verdict.reason} · price ${judged.price} (recorded, sha256 ${judged.responseSha256.slice(0, 12)}…)`,
          },
        ],
        structuredContent: judged,
      });
    }
    case "ping":
      return rpcResult(id ?? null, {});
    default:
      return rpcError(id ?? null, -32601, `method not found: ${method}`);
  }
}

export async function GET() {
  return NextResponse.json({
    server: SERVER.name,
    transport: "streamable-http (JSON-RPC POST)",
    tools: TOOLS.map((t) => t.name),
    usage: "POST JSON-RPC 2.0: initialize, tools/list, tools/call (assay_check)",
  });
}
