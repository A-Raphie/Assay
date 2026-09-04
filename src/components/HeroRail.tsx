"use client";

import { useEffect, useRef, useState } from "react";
import { AssetSlider } from "./AssetSlider";
import { LiveTicker } from "./LiveTicker";
import { DocketCard } from "./DocketCard";
import type { Verdict } from "@/engine/rules";

interface Sample {
  verdict: Verdict;
  symbol: string;
  notional: number;
  price: { symbol: string; lastPrice: string; changePct: string };
  responseSha256: string;
}

const CYCLE_ORDER = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

/**
 * Hero rail: the auto-cycling asset slider drives everything — live price,
 * sparkline, AND the sample verdict, which re-judges per selected asset off
 * the live MCP feed. Verdicts cache per asset and prefetch ahead of the
 * cycle, so the card switches in lockstep with the slider thumb.
 */
export function HeroRail() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [sample, setSample] = useState<Sample | null>(null);
  const cache = useRef<Map<string, Sample>>(new Map());
  const inflight = useRef<Set<string>>(new Set());

  const judge = (sym: string) => {
    if (cache.current.has(sym) || inflight.current.has(sym)) return;
    inflight.current.add(sym);
    fetch(`/api/verdict?symbol=${sym}&notional=50&live=1`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return;
        cache.current.set(sym, {
          verdict: d.verdict,
          symbol: d.requested.symbol,
          notional: d.requested.notional,
          price: { symbol: d.requested.symbol, lastPrice: d.market.price, changePct: d.market.change24hPct ?? "" },
          responseSha256: d.market.responseSha256,
        });
      })
      .catch(() => {})
      .finally(() => inflight.current.delete(sym));
  };

  // On asset switch: serve from cache instantly, judge if unseen.
  useEffect(() => {
    let alive = true;
    if (!cache.current.has(symbol)) {
      setSample(null);
      judge(symbol);
    }
    const poll = setInterval(() => {
      const s = cache.current.get(symbol);
      if (alive && s) setSample(s);
    }, 150);
    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, [symbol]);

  // Prefetch the next asset in the cycle so the card lands with the thumb.
  useEffect(() => {
    const next = CYCLE_ORDER[(CYCLE_ORDER.indexOf(symbol) + 1) % CYCLE_ORDER.length];
    const t = setTimeout(() => judge(next), 300);
    return () => clearTimeout(t);
  }, [symbol]);

  return (
    <div className="grid gap-4">
      <div className="rounded-card border border-line bg-panel p-6 card-depth">
        <div className="grid gap-4">
          <LiveTicker symbol={symbol} />
          <AssetSlider value={symbol} onChange={setSymbol} />
        </div>
        <p className="mt-3 font-mono text-[11px] text-ink-3">
          the price your agent would trade at, right now · cycles every 4s
        </p>
      </div>
      <div aria-live="polite">
        {sample ? (
          <DocketCard
            serial="live sample"
            verdict={sample.verdict}
            symbol={sample.symbol}
            notional={sample.notional}
            price={sample.price}
            transcriptHash={sample.responseSha256 ?? undefined}
            mode="LIVE"
            compact
          />
        ) : (
          <div className="rounded-card border border-line bg-panel p-5 card-depth" aria-hidden>
            <div className="h-3 w-28 rounded-sm bg-vessel" />
            <div className="mt-3 h-7 w-2/3 rounded-sm bg-vessel" />
            <div className="mt-3 h-3 w-full rounded-sm bg-vessel" />
          </div>
        )}
      </div>
    </div>
  );
}
