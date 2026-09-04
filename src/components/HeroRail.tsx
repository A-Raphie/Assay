"use client";

import { useState } from "react";
import { AssetSlider } from "./AssetSlider";
import { LiveTicker } from "./LiveTicker";
import { Sparkline } from "./Sparkline";
import { DocketCard } from "./DocketCard";
import type { Verdict } from "@/engine/rules";

/**
 * Hero rail: auto-cycling asset slider drives the live price + sparkline.
 * The proof card stays pinned underneath (server-rendered sample).
 */
export function HeroRail({
  proof,
}: {
  proof: {
    verdict: Verdict;
    order: { symbol: string; notional: number };
    price: { symbol: string; lastPrice: string; changePct: string };
    transcriptHash: string;
  } | null;
}) {
  const [symbol, setSymbol] = useState("BTCUSDT");

  return (
    <div className="grid gap-4">
      <div className="rounded-card border border-line bg-panel p-6 card-depth">
        <div className="grid gap-4">
          <LiveTicker symbol={symbol} />
          <AssetSlider value={symbol} onChange={setSymbol} />
          <Sparkline symbol={symbol} className="h-12 w-full" />
        </div>
        <p className="mt-3 font-mono text-[11px] text-ink-3">
          the price your agent would trade at, right now · 24h closes · cycles every 4s
        </p>
      </div>
      {proof && (
        <DocketCard
          serial="live sample · judged at page load"
          verdict={proof.verdict}
          symbol={proof.order.symbol}
          notional={proof.order.notional}
          price={proof.price}
          transcriptHash={proof.transcriptHash}
          mode="REPLAY"
        />
      )}
    </div>
  );
}
