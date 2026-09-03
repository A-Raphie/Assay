/** Shared REPLAY scenario definitions (client-safe; no server imports). */
export interface ReplayScenario {
  id: string;
  label: string;
  symbol: string;
  side: "BUY" | "SELL";
  notional: number;
  paperEquity: number;
  paperDayLossPct: number;
}

export const replayScenarios: ReplayScenario[] = [
  { id: "yolo-doge", label: "YOLO: 1,000 USDC into DOGE", symbol: "DOGEUSDT", side: "BUY", notional: 1000, paperEquity: 1000, paperDayLossPct: 0 },
  { id: "clean-btc", label: "Sane: 50 USDC into BTC", symbol: "BTCUSDT", side: "BUY", notional: 50, paperEquity: 1000, paperDayLossPct: 0 },
  { id: "tiny-btc", label: "Tiny: 10 USDC into BTC", symbol: "BTCUSDT", side: "BUY", notional: 10, paperEquity: 1000, paperDayLossPct: 0 },
  { id: "weird-pepe", label: "Odd: 20 USDC into PEPE", symbol: "PEPEUSDT", side: "BUY", notional: 20, paperEquity: 1000, paperDayLossPct: 0 },
  { id: "red-day", label: "Red day: any order after -6%", symbol: "BTCUSDT", side: "BUY", notional: 50, paperEquity: 1000, paperDayLossPct: 6 },
];
