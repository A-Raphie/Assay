"use client";

import { useEffect, useRef, useState } from "react";

interface Tick {
  lastPrice: string;
  changePct: string;
}

/**
 * Live ticker: hero number (winsznx money class), green dot + live pairing,
 * delta chip, flashes on move. Polls the cached /api/ticker route.
 */
export function LiveTicker({ symbol = "BTCUSDT" }: { symbol?: string }) {
  const [tick, setTick] = useState<Tick | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const r = await fetch(`/api/ticker?symbol=${symbol}`);
        const d = await r.json();
        if (!alive || !d.ok) return;
        const now = Number(d.lastPrice);
        if (prev.current !== null && now !== prev.current) {
          setFlash(now > prev.current ? "up" : "down");
          setTimeout(() => alive && setFlash(null), 1200);
        }
        prev.current = now;
        setTick({ lastPrice: d.lastPrice, changePct: d.changePct });
      } catch {
        /* silent: strip keeps last value */
      }
    };
    pull();
    const id = setInterval(pull, 20_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [symbol]);

  const up = Number(tick?.changePct ?? 0) >= 0;

  return (
    <div className="grid gap-2">
      <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-ink-3">
        <span className="dot-live" /> {symbol} · live · binance mcp
      </span>
      {/* Fixed-height rows (winsznx: delta chip sits below the number). Data
          arriving must never shift layout: both rows are height-reserved. */}
      <div className="grid gap-2">
        <span
          className={`number-xl flex h-[54px] items-center whitespace-nowrap tabular-nums md:h-[68px] ${flash ? (flash === "up" ? "tick-up" : "tick-down") : ""}`}
        >
          {tick ? Number(tick.lastPrice).toLocaleString("en-US", { maximumFractionDigits: 2 }) : "…"}
        </span>
        <span className="flex min-h-[28px] items-center">
          {tick && (
            <span
              className={`inline-block rounded-full px-2.5 py-1 font-mono text-xs font-semibold ${
                up ? "bg-pass/15 text-pass" : "bg-deny/15 text-deny-text"
              }`}
            >
              {up ? "▲" : "▼"} {Math.abs(Number(tick.changePct)).toFixed(2)}% 24h
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
