import { describe, expect, it } from "vitest";
import { baseAssetOf, check, type DayContext, type Order, type RuleSet } from "./rules";

const rules: RuleSet = { maxTradePct: 2, dailyHaltPct: 5, allowlist: ["BTC", "ETH", "BNB"] };
const greenCtx: DayContext = { equityStartOfDay: 1000, equityNow: 1000 };
const redCtx: DayContext = { equityStartOfDay: 1000, equityNow: 940 };

const order = (over: Partial<Order> = {}): Order => ({
  symbol: "BTCUSDC",
  side: "BUY",
  type: "MARKET",
  quantity: 0.0001,
  notional: 2,
  source: "REPLAY",
  ...over,
});

describe("assay.check", () => {
  it("passes an order within all rules", () => {
    const v = check(order({ notional: 2 }), rules, greenCtx);
    expect(v.action).toBe("PASS");
    expect(v.rule).toBeNull();
    expect(v.citation).toBeNull();
  });

  it("resizes an order over the per-trade cap and cites rule 1", () => {
    const v = check(order({ notional: 100, quantity: 0.001 }), rules, greenCtx);
    expect(v.action).toBe("RESIZE");
    expect(v.rule).toBe("rule1");
    expect(v.citation).toBe("Rule 1: max 2% per trade");
    expect(v.adjustedNotional).toBe(20);
    expect(v.adjustedQuantity).toBeCloseTo(0.0002, 6);
  });

  it("blocks a symbol off the allowlist and cites rule 3", () => {
    const v = check(order({ symbol: "DOGEUSDC" }), rules, greenCtx);
    expect(v.action).toBe("BLOCK");
    expect(v.rule).toBe("rule3");
    expect(v.reason).toContain("DOGE is not on your allowlist");
  });

  it("halts everything when the day loss trips rule 2", () => {
    const v = check(order({ notional: 2 }), rules, redCtx);
    expect(v.action).toBe("HALT");
    expect(v.rule).toBe("rule2");
    expect(v.reason).toContain("Down 6.00%");
  });

  it("halt wins over block: a bad symbol still reports HALT first", () => {
    const v = check(order({ symbol: "PEPEUSDT" }), rules, redCtx);
    expect(v.action).toBe("HALT");
  });

  it("blocks when equity is zero (cap resolves to nothing)", () => {
    const v = check(order({ notional: 5 }), rules, { equityStartOfDay: 0, equityNow: 0 });
    expect(v.action).toBe("BLOCK");
    expect(v.rule).toBe("rule1");
  });

  it("passes exactly at the cap boundary", () => {
    const v = check(order({ notional: 20 }), rules, greenCtx);
    expect(v.action).toBe("PASS");
  });

  it("resizes to a capped floor without crossing the cap after rounding", () => {
    const v = check(order({ notional: 33.33 }), rules, greenCtx);
    expect(v.action).toBe("RESIZE");
    expect(v.adjustedNotional as number).toBeLessThanOrEqual(20);
  });
});

describe("baseAssetOf", () => {
  it("splits major pairs", () => {
    expect(baseAssetOf("BTCUSDC")).toBe("BTC");
    expect(baseAssetOf("ETHUSDT")).toBe("ETH");
  });
  it("handles 1000-prefix meme pairs", () => {
    expect(baseAssetOf("1000SATSUSDT")).toBe("1000SATS");
  });
  it("returns null for garbage", () => {
    expect(baseAssetOf("USDC")).toBeNull();
  });
});
