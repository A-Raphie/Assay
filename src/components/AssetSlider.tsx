"use client";

import { useEffect, useRef, useState } from "react";

const ASSETS = [
  { symbol: "BTCUSDT", label: "BTC" },
  { symbol: "ETHUSDT", label: "ETH" },
  { symbol: "BNBUSDT", label: "BNB" },
];

const CYCLE_MS = 4000;
const HOLD_AFTER_TOUCH_MS = 12000;

/**
 * Asset slider: auto-cycles BTC -> ETH -> BNB every few seconds.
 * Clicking a segment jumps to it and pauses the cycle for a while.
 */
export function AssetSlider({ value, onChange }: { value: string; onChange: (symbol: string) => void }) {
  const [index, setIndex] = useState(0);
  const holdUntil = useRef(0);

  // Auto-cycle unless the user just interacted.
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() < holdUntil.current) return;
      setIndex((i) => {
        const next = (i + 1) % ASSETS.length;
        onChange(ASSETS[next].symbol);
        return next;
      });
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [onChange]);

  const pick = (i: number) => {
    holdUntil.current = Date.now() + HOLD_AFTER_TOUCH_MS;
    setIndex(i);
    onChange(ASSETS[i].symbol);
  };

  return (
    <div
      role="tablist"
      aria-label="Asset"
      className="relative grid grid-cols-3 rounded-full border border-line bg-vessel p-1"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc(33.333%-4px)] rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {ASSETS.map((a, i) => (
        <button
          key={a.symbol}
          role="tab"
          aria-selected={value === a.symbol}
          onClick={() => pick(i)}
          className={`relative z-10 rounded-full py-1.5 font-mono text-xs font-semibold tracking-widest transition-colors duration-300 ${
            index === i ? "text-on-accent" : "text-ink opacity-80 hover:opacity-100 hover:text-ink"
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
