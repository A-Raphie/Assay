import Link from "next/link";
import { check, type DayContext, type Order, type Verdict } from "@/engine/rules";
import { parseTranscriptJsonl } from "@/mcp/replay";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Public docket: /d/[id] where id = base64url of the judged order params.
 * Stateless: the payload carries the order; the verdict is RE-COMPUTED live
 * from the committed transcript on every open, so a shared link proves the
 * engine, not a screenshot.
 */

export const dynamic = "force-dynamic";

function decode(id: string): { symbol: string; notional: number; maxTradePct: number } | null {
  try {
    const json = Buffer.from(id.replace(/-/g, "+").replace(/_/g, "/"), "base64url").toString("utf8");
    const p = JSON.parse(json);
    const symbol = String(p.s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    const notional = Number(p.n);
    const maxTradePct = Number(p.r ?? 2);
    if (!symbol || !Number.isFinite(notional) || notional <= 0) return null;
    return { symbol, notional, maxTradePct: Math.min(100, Math.max(0.1, maxTradePct)) };
  } catch {
    return null;
  }
}

function judge(symbol: string, notional: number, maxTradePct: number) {
  const jsonl = readFileSync(join(process.cwd(), "src/data/replay/baseline.jsonl"), "utf8");
  const frames = parseTranscriptJsonl(jsonl);
  const frame = frames.find((f) => f.tool === "spot.ticker24hr" && f.argsJson.includes(symbol));
  if (!frame || !frame.verified) return null;
  const response = JSON.parse(frame.responseJson);
  const payload =
    response.result?.structuredContent ?? JSON.parse(response.result?.content?.[0]?.text ?? "{}");
  const price = Number(payload.lastPrice);
  const paperEquity = 1000;
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
    verdict,
    order,
    price: { symbol, lastPrice: String(price), changePct: String(payload.priceChangePercent ?? "") },
    transcriptHash: frame.responseSha256,
  };
}

const stampCls = (action: Verdict["action"]) =>
  action === "RESIZE" ? "border-accent text-accent" : action === "PASS" ? "border-pass text-pass" : "border-deny text-deny-text";

export default async function PublicDocket({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decode(id);
  const result = decoded ? judge(decoded.symbol, decoded.notional, decoded.maxTradePct) : null;

  return (
    <main className="mx-auto grid min-h-[85vh] w-full max-w-2xl content-center px-6">
      {!result || !decoded ? (
        <div className="rounded-card border border-line bg-panel p-8 text-center card-depth">
          <p className="font-mono text-xs tracking-[0.3em] text-accent">MALFORMED LINK</p>
          <h1 className="mt-3 text-2xl font-bold">This docket link is malformed.</h1>
          <p className="mt-2 text-sm text-ink-2">The order payload could not be read.</p>
          <Link href="/" className="mt-6 inline-block rounded-card bg-accent-bright px-5 py-2.5 font-mono text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent active:scale-[0.98]">
            Back to the front door
          </Link>
        </div>
      ) : (
        <article className="rounded-card border border-line bg-panel p-8 card-depth">
          <header className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs tracking-widest text-ink-3">public docket · Assay</span>
            <span
              className={`rounded-stamp border-2 px-3 py-1 font-mono text-lg font-bold tracking-[0.15em] rotate-[-6deg] ${stampCls(result.verdict.action)}`}
            >
              {result.verdict.action}
            </span>
          </header>

          <h1 className="mt-5 text-4xl font-bold tracking-tight">
            {result.order.symbol} · <span className="whitespace-nowrap tabular-nums">{result.order.notional.toFixed(2)} USDC</span>
          </h1>
          <p className="mt-1 font-mono text-xs text-ink-2 tabular-nums">
            {result.price.symbol} @ {result.price.lastPrice} · 24h {result.price.changePct}%
          </p>

          <p className="mt-4 text-base leading-relaxed">
            {result.verdict.citation ? `${result.verdict.citation} · ` : ""}
            <span className="text-ink-2">{result.verdict.reason}</span>
          </p>

          <dl className="mt-6 grid gap-2 border-t border-line pt-4 font-mono text-xs text-ink-3">
            <div className="flex justify-between gap-4">
              <dt>engine</dt>
              <dd className="text-right text-ink-2">recomputed live at open, same as the desk</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>price source</dt>
              <dd className="text-right text-ink-2">recorded mcp transcript</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>response sha256</dt>
              <dd className="text-right text-ink-2">{result.transcriptHash.slice(0, 20)}…</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/desk"
              className="rounded-card bg-accent-bright px-5 py-2.5 font-mono text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent hover:shadow-[0_0_20px_var(--glow-accent)] active:scale-[0.98]"
            >
              Judge your own order
            </Link>
            <Link href="/" className="self-center font-mono text-sm text-accent hover:underline">
              what is Assay?
            </Link>
          </div>
        </article>
      )}
    </main>
  );
}
