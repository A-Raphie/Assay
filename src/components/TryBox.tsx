"use client";

import { useState } from "react";
import type { Verdict } from "@/engine/rules";

/**
 * The interactive verdict box: type an order, judge it. Wired to /api/verdict
 * (same engine, real recorded price). This is the product's one job, runnable
 * from the landing page in five seconds.
 */
export function TryBox() {
  const [symbol, setSymbol] = useState("DOGEUSDT");
  const [notional, setNotional] = useState("1000");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const judge = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/verdict?symbol=${encodeURIComponent(symbol)}&notional=${encodeURIComponent(notional)}`);
      const d = await r.json();
      if (!r.ok) setError(d.error ?? "verdict failed");
      else setResult(d);
    } catch {
      setError("network error: try again");
    }
    setBusy(false);
  };

  const v: Verdict | null = result?.verdict ?? null;
  const action = v?.action;
  const stampCls =
    action === "RESIZE" ? "border-accent text-accent" : action === "PASS" ? "border-pass text-pass" : "border-deny text-deny-text";

  return (
    <div className="rounded-card border border-line bg-panel p-6 card-depth">
      <p className="font-mono text-xs tracking-widest text-ink-3">TRY IT: JUDGE AN ORDER</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1.5">
          <span className="font-mono text-[11px] text-ink-3">symbol</span>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-36 rounded-[10px] border border-line bg-vessel px-3 py-2.5 font-mono text-sm text-ink outline-none transition-colors duration-150 focus:border-accent"
            aria-label="symbol"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="font-mono text-[11px] text-ink-3">amount (usdc)</span>
          <input
            value={notional}
            onChange={(e) => setNotional(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-28 rounded-[10px] border border-line bg-vessel px-3 py-2.5 font-mono text-sm text-ink outline-none transition-colors duration-150 focus:border-accent"
            aria-label="amount in usdc"
            inputMode="decimal"
          />
        </label>
        <button
          onClick={judge}
          disabled={busy}
          className="h-[42px] rounded-[10px] bg-accent-bright px-5 font-mono text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent hover:shadow-[0_0_20px_var(--glow-accent)] active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Judging…" : "Judge it"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-deny-text">
          {error}
        </p>
      )}

      {result && !error && (
        <div role="status" aria-live="polite" className="mt-5 grid gap-2 rounded-[10px] border border-line bg-vessel p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold">
              {result.requested.symbol} · {result.requested.notional} USDC
            </span>
            <span className={`rounded-stamp border-2 px-2 py-0.5 font-mono text-sm font-bold tracking-[0.15em] ${stampCls}`}>
              {action}
            </span>
          </div>
          <p className="text-sm text-ink-2">
            {v?.citation ? `${v.citation} · ` : ""}
            {v?.reason}
          </p>
          <p className="font-mono text-[11px] text-ink-3">
            price {result.market.price} (recorded) · entry sha256 {String(result.market.responseSha256).slice(0, 12)}…
          </p>
        </div>
      )}
      {!result && !error && (
        <p className="mt-4 text-xs leading-relaxed text-ink-3">
          Judged against the real recorded price through the same engine the desk uses. Try 1000
          into DOGEUSDT, then 10 into BTCUSDT.
        </p>
      )}
    </div>
  );
}
