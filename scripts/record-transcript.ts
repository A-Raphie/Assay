/**
 * Records a real Binance MCP transcript for REPLAY mode.
 * Run: npx tsx scripts/record-transcript.ts
 * Output: src/data/replay/baseline.jsonl (committed; hashes make it verifiable)
 */

import { BinanceMcp } from "../src/mcp/binance";
import { writeFileSync, mkdirSync } from "node:fs";

async function main() {
  const token = process.env.BINANCE_MCP_TOKEN;
  if (!token) throw new Error("BINANCE_MCP_TOKEN missing: load .env.local first");
  const mcp = new BinanceMcp(token);

  // Real market + account reads, in demo order.
  await mcp.execute("spot.ticker24hr", { symbol: "BTCUSDT" });
  await mcp.execute("spot.ticker24hr", { symbol: "DOGEUSDT" });
  await mcp.execute("spot.exchangeInfo", { symbol: "DOGEUSDT" });
  await mcp.execute("spot.getAccount", {});
  await mcp.execute("convert.listAllConvertPairs", { fromAsset: "USDT", toAsset: "DOGE" });

  mkdirSync("src/data/replay", { recursive: true });
  writeFileSync("src/data/replay/baseline.jsonl", mcp.transcriptJsonl() + "\n");
  console.log("recorded", mcp.transcript.length, "entries -> src/data/replay/baseline.jsonl");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
