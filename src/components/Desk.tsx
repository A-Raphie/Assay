"use client";

import { useCallback, useEffect, useState } from "react";
import { DocketCard } from "./DocketCard";
import { useRules } from "./RulesForm";
import { liveContext, proposeLive, replayScenario, type DeskResult } from "@/app/actions";
import { replayScenarios } from "@/lib/scenarios";
import type { Order } from "@/engine/rules";

interface FeedItem {
  serial: string;
  verdict: NonNullable<DeskResult["verdict"]>;
  order: Order;
  price?: DeskResult["price"];
  transcriptHash?: string;
  mode: "LIVE" | "REPLAY";
  at: string;
}

const FEED_KEY = "assay.feed.v1";

function loadFeed(): FeedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FEED_KEY);
    return raw ? (JSON.parse(raw) as FeedItem[]) : [];
  } catch {
    return [];
  }
}

function saveFeed(feed: FeedItem[]) {
  // Keep the docket bounded: latest 50 entries.
  window.localStorage.setItem(FEED_KEY, JSON.stringify(feed.slice(0, 50)));
}

export function Desk() {
  const [rules, setRules] = useRules();
  const [mode, setMode] = useState<"LIVE" | "REPLAY">("REPLAY");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState<DeskResult | null>(null);
  const [symbol, setSymbol] = useState("BTCUSDC");
  const [notional, setNotional] = useState("50");

  useEffect(() => {
    setFeed(loadFeed());
    let on = true;
    liveContext().then((r) => on && setLive(r));
    return () => {
      on = false;
    };
  }, []);

  const push = useCallback((r: DeskResult, m: "LIVE" | "REPLAY") => {
    if (!r.ok || !r.verdict || !r.order) {
      setError(r.error ?? "Unknown error");
      return;
    }
    setError(null);
    setFeed((prev) => {
      const next: FeedItem[] = [
        {
          serial: `ASSAY-${String(prev.length + 1).padStart(4, "0")}`,
          verdict: r.verdict!,
          order: r.order!,
          price: r.price,
          transcriptHash: r.transcriptHash,
          mode: m,
          at: new Date().toISOString().slice(11, 19) + " UTC",
        },
        ...prev,
      ];
      saveFeed(next);
      return next;
    });
  }, []);

  const runLive = async () => {
    setBusy(true);
    push(await proposeLive({ symbol, side: "BUY", notional: Number(notional), rules }), "LIVE");
    setBusy(false);
  };

  const runReplay = async (id: string) => {
    setBusy(true);
    push(await replayScenario(id, rules), "REPLAY");
    setBusy(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      {/* left rail: mode + rules summary + propose */}
      <aside className="grid content-start gap-6">
        <section className="rounded-card border border-line bg-panel p-5">
          <h2 className="text-sm text-ink-2">Mode</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["REPLAY", "LIVE"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-card border px-3 py-2 font-mono text-sm tracking-widest transition-colors ${
                  mode === m ? "border-accent bg-accent text-on-accent" : "border-line text-ink-2 hover:border-accent hover:text-accent"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-3">
            {mode === "LIVE"
              ? "Real sub-account through the Binance MCP Server. Verdicts stop before execution."
              : "Same engine, hash-verified recorded market data. Paper equity: 1,000 USDC (declared)."}
          </p>
        </section>

        <section className="rounded-card border border-line bg-panel p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm text-ink-2">Your rules</h2>
            <a href="/rules" className="font-mono text-xs text-accent hover:underline">
              edit
            </a>
          </div>
          <ul className="mt-3 grid gap-1.5 font-mono text-sm text-ink">
            <li>1 · max {rules.maxTradePct}% per trade</li>
            <li>2 · halt at {rules.dailyHaltPct}% day loss</li>
            <li>3 · {rules.allowlist.join(" · ")}</li>
          </ul>
        </section>

        {mode === "LIVE" ? (
          <section className="rounded-card border border-line bg-panel p-5">
            <h2 className="text-sm text-ink-2">Propose an order</h2>
            <div className="mt-3 grid gap-3">
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                aria-label="Symbol"
                className="rounded-card border border-line bg-vessel px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
              />
              <label className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={notional}
                  onChange={(e) => setNotional(e.target.value)}
                  aria-label="Notional in USDC"
                  className="w-full rounded-card border border-line bg-vessel px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
                />
                <span className="font-mono text-sm text-ink-3">USDC</span>
              </label>
              <button
                onClick={runLive}
                disabled={busy}
                className="rounded-card bg-accent-bright px-4 py-2.5 font-mono text-sm font-semibold tracking-wide text-on-accent hover:bg-accent disabled:opacity-50"
              >
                {busy ? "Checking…" : "Run the check"}
              </button>
            </div>
            {live?.price && (
              <p className="mt-3 font-mono text-xs text-ink-3">
                live {live.price.symbol} {live.price.lastPrice} · 24h {live.price.changePct}%
              </p>
            )}
            {live?.account && (
              <p className="mt-1 font-mono text-xs text-ink-3">
                sub-account USDC {live.account.usdc} · USDT {live.account.usdt}
                {!live.account.canTrade && " · trading disabled"}
              </p>
            )}
          </section>
        ) : (
          <section className="rounded-card border border-line bg-panel p-5">
            <h2 className="text-sm text-ink-2">Replay a scenario</h2>
            <div className="mt-3 grid gap-2">
              {replayScenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => runReplay(s.id)}
                  disabled={busy}
                  className="rounded-card border border-line bg-vessel px-3 py-2.5 text-left font-mono text-sm text-ink hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-3">
              Recorded from real MCP responses, sha256 stamped. The engine that judges these is the one that judges LIVE.
            </p>
          </section>
        )}
      </aside>

      {/* right: the docket */}
      <section aria-label="Activity feed" className="grid content-start gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-mono text-sm tracking-widest text-ink-2">THE DOCKET</h2>
          <span className="font-mono text-xs text-ink-3">{feed.length} entries</span>
        </div>

        {error && (
          <p role="alert" className="rounded-card border border-deny bg-panel px-4 py-3 text-sm text-deny">
            {error}
          </p>
        )}

        {feed.length === 0 && (
          <div className="rounded-card border border-dashed border-line px-6 py-10 text-center">
            <p className="text-sm text-ink-2">No orders checked yet.</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              {mode === "LIVE"
                ? "Propose any order on the left: Assay prices it against the real book and judges it before Binance ever sees it."
                : "Run a scenario on the left: the YOLO one shows a 1,000 USDC order getting cut to your cap in one strike."}
            </p>
          </div>
        )}

        {feed.map((f) => (
          <DocketCard
            key={f.serial}
            serial={`${f.serial} · ${f.at}`}
            verdict={f.verdict}
            symbol={f.order.symbol}
            notional={f.order.notional}
            price={f.price}
            transcriptHash={f.transcriptHash}
            mode={f.mode}
            animate
          />
        ))}
      </section>
    </div>
  );
}
