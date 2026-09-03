import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Readable } from "node:stream";

/**
 * Route-handler tests for /api/verdict. The MCP client is mocked so these run
 * offline and deterministic; the transcript fixture is the real recorded shape.
 */

const execute = vi.fn();
const initialize = vi.fn();

vi.mock("@/mcp/binance", () => ({
  BinanceMcp: class {
    transcript: any[] = [];
    async initialize() {
      return initialize();
    }
    async execute(tool: string, args: Record<string, unknown>) {
      return execute(tool, args);
    }
  },
}));

// Import AFTER the mock is registered.
const { GET } = await import("./route");

function req(url: string) {
  return { nextUrl: new URL(url) } as any;
}

const tickerResponse = {
  structured: {
    lastPrice: "0.0831",
    priceChangePercent: "2.834",
  },
};

describe("GET /api/verdict", () => {
  beforeEach(() => {
    execute.mockReset();
    initialize.mockReset();
    execute.mockResolvedValue(tickerResponse);
    initialize.mockResolvedValue(undefined);
  });

  it("blocks DOGE 1000 on the allowlist rule", async () => {
    const res = await GET(req("https://assay.test/api/verdict?symbol=DOGEUSDT&notional=1000"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.requested.symbol).toBe("DOGEUSDT");
    expect(body.verdict.action).toBe("BLOCK");
    expect(body.verdict.citation).toContain("Rule 3");
    expect(body.market.price).toBe("0.0831");
  });

  it("resizes BTC 50 to the cap", async () => {
    execute.mockResolvedValue({ structured: { lastPrice: "77885.74", priceChangePercent: "1.679" } });
    const res = await GET(req("https://assay.test/api/verdict?symbol=BTCUSDT&notional=50"));
    const body = await res.json();
    expect(body.verdict.action).toBe("RESIZE");
    expect(body.verdict.adjustedNotional).toBe(20);
  });

  it("passes BTC 10", async () => {
    execute.mockResolvedValue({ structured: { lastPrice: "77885.74", priceChangePercent: "1.679" } });
    const res = await GET(req("https://assay.test/api/verdict?symbol=BTCUSDT&notional=10"));
    const body = await res.json();
    expect(body.verdict.action).toBe("PASS");
  });

  it("404s an unrecorded symbol instead of guessing a price", async () => {
    const res = await GET(req("https://assay.test/api/verdict?symbol=PEPEUSDT"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("no recorded ticker");
  });

  it("rejects non-positive notional with a 400", async () => {
    const res = await GET(req("https://assay.test/api/verdict?symbol=BTCUSDT&notional=-5"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("positive");
  });

  it("strips hostile characters from the symbol", async () => {
    const res = await GET(req("https://assay.test/api/verdict?symbol=<script>"));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(JSON.stringify(body)).not.toContain("<script>");
  });
});
