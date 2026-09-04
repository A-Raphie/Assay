"use client";

import { useEffect, useState } from "react";
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

/**
 * Hero rail: the auto-cycling asset slider drives everything — live price,
 * sparkline, AND the sample verdict, which re-judges per selected asset off
 * the live MCP feed. One instrument, one glance.
 */
export function HeroRail() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [sample, setSample] = useState<Sample | null>(null);
  const [sampleBusy, setSampleBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setSampleBusy(true);
    fetch(`/api/verdict?symbol=${symbol}&notional=50&live=1`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d.ok) return;
        setSample({
          verdict: d.verdict,
          symbol: d.requested.symbol,
          notional: d.requested.notional,
          price: { symbol: d.requested.symbol, lastPrice: d.market.price, changePct: d.market.change24hPct ?? "" },
          responseSha256: d.market.responseSha256,
        });
      })
      .catch(() => {})
      .finally(() => alive && setSampleBusy(false));
    return () => {
      alive = false;
    };
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
            serial={`live sample · ${symbol} · judged from the live feed`}
            verdict={sample.verdict}
            symbol={sample.symbol}
            notional={sample.notional}
            price={sample.price}
            transcriptHash={sample.responseSha256 ?? undefined}
            mode="LIVE"
          />
        ) : (
          <div className="rounded-card border border-line bg-panel p-5 card-depth" aria-hidden>
            <div className="h-3 w-28 rounded-sm bg-vessel" />
            <div className="mt-3 h-7 w-2/3 rounded-sm bg-vessel" />
            <div className="mt-3 h-3 w-full rounded-sm bg-vessel" />
          </div>
        )}
        <p className="mt-2 font-mono text-[11px] text-ink-3">
          {sampleBusy ? "judging against the live book…" : "re-judged live on every asset switch"}
        </p>
      </div>
    </div>
  );
}
