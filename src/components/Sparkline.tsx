"use client";

import { useEffect, useState } from "react";

/**
 * SVG sparkline from real kline closes (via /api/klines). Pure polyline,
 * gradient fill underneath, no chart lib.
 */
export function Sparkline({
  symbol = "BTCUSDT",
  interval = "1h",
  limit = 24,
  className = "",
}: {
  symbol?: string;
  interval?: string;
  limit?: number;
  className?: string;
}) {
  const [closes, setCloses] = useState<number[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(`/api/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d.ok && Array.isArray(d.closes) && d.closes.length > 1) setCloses(d.closes);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [symbol, interval, limit]);

  if (closes.length < 2) {
    return <div className={`h-12 rounded-sm bg-vessel ${className}`} aria-hidden />;
  }

  const w = 240;
  const h = 48;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const pts = closes.map((c, i) => {
    const x = (i / (closes.length - 1)) * w;
    const y = h - ((c - min) / span) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const up = closes[closes.length - 1] >= closes[0];
  const stroke = up ? "var(--pass)" : "var(--deny)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label={`${symbol} ${interval} closes sparkline`}>
      <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={stroke} opacity="0.12" />
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
