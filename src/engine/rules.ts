/**
 * Assay rules engine.
 * Pure functions, zero I/O. The same code path serves LIVE and REPLAY modes.
 * All verdicts cite the rule in the words the user wrote.
 */

export type Side = "BUY" | "SELL";

export interface Order {
  symbol: string;
  side: Side;
  type: "MARKET" | "LIMIT";
  /** Base-asset quantity */
  quantity: number;
  /** Notional value in quote asset (USDC/USDT). For MARKET BUY this is what Binance spends. */
  notional: number;
  source: "LIVE" | "REPLAY";
}

export interface RuleSet {
  /** Rule 1: max percent of sub-account equity per trade, 0-100 */
  maxTradePct: number;
  /** Rule 2: halt all trading when day loss exceeds this percent of equity */
  dailyHaltPct: number;
  /** Rule 3: only these base assets may trade */
  allowlist: string[];
}

export interface DayContext {
  /** Sub-account equity in quote asset at the 00:00 UTC reset */
  equityStartOfDay: number;
  /** Equity right now */
  equityNow: number;
}

export type VerdictAction = "PASS" | "RESIZE" | "BLOCK" | "HALT";

export interface Verdict {
  action: VerdictAction;
  /** Machine rule id that fired: rule1 | rule2 | rule3, null for PASS */
  rule: "rule1" | "rule2" | "rule3" | null;
  /** Human rule citation, e.g. "Rule 1: max 2% per trade" */
  citation: string | null;
  reason: string;
  /** Set on RESIZE: the order that may proceed */
  adjustedNotional?: number;
  adjustedQuantity?: number;
}

/** Day loss percent, positive number when losing. */
export function dayLossPct(ctx: DayContext): number {
  if (ctx.equityStartOfDay <= 0) return 0;
  return ((ctx.equityStartOfDay - ctx.equityNow) / ctx.equityStartOfDay) * 100;
}

/**
 * Check a proposed order against the rules.
 * Order of evaluation: HALT first (market condition), then BLOCK (order is
 * forbidden as-is), then RESIZE (order may proceed smaller), then PASS.
 */
export function check(
  order: Order,
  rules: RuleSet,
  ctx: DayContext,
): Verdict {
  // Rule 2 first: a tripped daily halt stops everything, even good orders.
  const loss = dayLossPct(ctx);
  if (loss >= rules.dailyHaltPct) {
    return {
      action: "HALT",
      rule: "rule2",
      citation: `Rule 2: halt at ${rules.dailyHaltPct}% daily loss`,
      reason: `Down ${loss.toFixed(2)}% today. All trading stopped until tomorrow's 00:00 UTC reset.`,
    };
  }

  // Rule 3: allowlist.
  const base = baseAssetOf(order.symbol);
  if (base !== null && !rules.allowlist.includes(base)) {
    return {
      action: "BLOCK",
      rule: "rule3",
      citation: `Rule 3: ${rules.allowlist.join(", ")} only`,
      reason: `${base} is not on your allowlist.`,
    };
  }

  // Rule 1: per-trade cap. Resize down when over.
  const maxNotional = (ctx.equityNow * rules.maxTradePct) / 100;
  if (order.notional > maxNotional) {
    // When equity cannot fund even the minimum, the cap itself blocks.
    if (maxNotional <= 0) {
      return {
        action: "BLOCK",
        rule: "rule1",
        citation: `Rule 1: max ${rules.maxTradePct}% per trade`,
        reason: "Sub-account equity is zero. Nothing to trade with.",
      };
    }
    const ratio = maxNotional / order.notional;
    return {
      action: "RESIZE",
      rule: "rule1",
      citation: `Rule 1: max ${rules.maxTradePct}% per trade`,
      reason: `${order.notional.toFixed(2)} USDC over the cap. Cut to ${maxNotional.toFixed(2)} USDC.`,
      adjustedNotional: roundToTick(maxNotional),
      adjustedQuantity: roundToTick(order.quantity * ratio),
    };
  }

  return {
    action: "PASS",
    rule: null,
    citation: null,
    reason: `Within rules: ${order.notional.toFixed(2)} USDC of ${rules.maxTradePct}% cap.`,
  };
}

/** BTCUSDT -> BTC; 1000SATSUSDT -> 1000SATS; unknown -> null */
export function baseAssetOf(symbol: string): string | null {
  for (const quote of ["USDC", "USDT", "FDUSD", "TUSD", "BUSD", "BTC", "ETH", "BNB"]) {
    if (symbol.endsWith(quote) && symbol.length > quote.length) {
      return symbol.slice(0, symbol.length - quote.length);
    }
  }
  return null;
}

function roundToTick(n: number): number {
  return Math.floor(n * 1e6) / 1e6;
}
