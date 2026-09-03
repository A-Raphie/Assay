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
  entryHash?: string;
  scenario?: string;
  mode: "LIVE" | "REPLAY";
  at: string;
}

const FEED_KEY = "assay.feed.v1";

async function entryHashOf(transcriptHash: string | undefined, order: Order, at: string): Promise<string> {
  // The docket entry's own hash: transcript response + the exact order judged.
  // Distinct checks produce distinct hashes; identical ones prove identical inputs.
  const material = `${transcriptHash ?? ""}|${JSON.stringify(order)}|${at}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
  const [mode, setMode] = useState<"REPLAY" | "CONFIRM_LIVE" | "LIVE">("REPLAY");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState<DeskResult | null>(null);
  const [symbol, setSymbol] = useState("BTCUSDC");
  const [notional, setNotional] = useState("50");

  const clearFeed = () => {
    setFeed([]);
    saveFeed([]);
  };

  useEffect(() => {
    setFeed(loadFeed());
    let on = true;
    liveContext().then((r) => on && setLive(r));
    return () => {
      on = false;
    };
  }, []);

  const push = useCallback(async (r: DeskResult, m: "LIVE" | "REPLAY", scenario?: string) => {
    if (!r.ok || !r.verdict || !r.order) {
      setError(r.error ?? "Unknown error");
      return;
    }
    setError(null);
    const at = new Date().toISOString().slice(11, 19) + " UTC";
    const hash = await entryHashOf(r.transcriptHash, r.order, at);
    setFeed((prev) => {
      const next: FeedItem[] = [
        {
          serial: `ASSAY-${String(prev.length + 1).padStart(4, "0")}`,
          verdict: r.verdict!,
          order: r.order!,
          price: r.price,
          transcriptHash: r.transcriptHash,
          entryHash: hash,
          scenario,
          mode: m,
          at,
        },
        ...prev,
      ];
      saveFeed(next);
      return next;
    });
  }, []);

  const runLive = async () => {
    setBusy(true);
    setBusyId("live");
    push(await proposeLive({ symbol, side: "BUY", notional: Number(notional), rules }), "LIVE", `${symbol} · manual`);
    setBusy(false);
    setBusyId(null);
  };

  const runReplay = async (id: string) => {
    const scenario = replayScenarios.find((s) => s.id === id);
    setBusy(true);
    setBusyId(id);
    push(await replayScenario(id, rules), "REPLAY", scenario?.label);
    setBusy(false);
    setBusyId(null);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      {/* left rail: mode + rules summary + propose */}
      <aside className="grid content-start gap-6">
        <section className="rounded-card border border-line bg-panel p-5">
          <h2 className="text-sm text-ink-2">Mode</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["REPLAY", "LIVE"] as const).map((m) => {
              const current = mode === m || (m === "LIVE" && mode === "CONFIRM_LIVE");
              return (
                <button
                  key={m}
                  onClick={() => setMode(m === "LIVE" && mode !== "LIVE" ? "CONFIRM_LIVE" : "REPLAY")}
                  aria-pressed={current}
                  className={`rounded-card border px-3 py-2 font-mono text-sm tracking-widest transition-all duration-150 active:scale-[0.98] ${
                    current
                      ? m === "LIVE"
                        ? "border-deny bg-deny text-white"
                        : "border-accent bg-accent text-on-accent"
                      : "border-line text-ink-2 hover:border-accent hover:text-accent"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
          {mode === "CONFIRM_LIVE" && (
            <div className="mt-3 rounded-card border border-deny/60 bg-vessel p-3">
              <p className="text-xs leading-relaxed text-ink">
                LIVE reads your real Agentic sub-account through the Binance MCP Server. Verdicts
                still stop before execution.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setMode("LIVE")}
                  className="rounded-stamp border border-deny px-3 py-1 font-mono text-xs font-semibold text-deny transition-transform duration-150 active:scale-[0.98]"
                >
                  Arm LIVE
                </button>
                <button
                  onClick={() => setMode("REPLAY")}
                  className="rounded-stamp border border-line px-3 py-1 font-mono text-xs text-ink-2 transition-transform duration-150 hover:border-accent hover:text-accent active:scale-[0.98]"
                >
                  Stay on REPLAY
                </button>
              </div>
            </div>
          )}
          <p className="mt-3 text-xs leading-relaxed text-ink-3">
            {mode === "REPLAY"
              ? "Same engine, hash-verified recorded market data. Paper equity: 1,000 USDC (declared)."
              : "Real sub-account through the Binance MCP Server. Verdicts stop before execution."}
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
                className="rounded-card bg-accent-bright px-4 py-2.5 font-mono text-sm font-semibold tracking-wide text-on-accent transition-all duration-150 hover:bg-accent active:scale-[0.98] disabled:opacity-50"
              >
                {busyId === "live" ? "Judging…" : "Run the check"}
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
                  className="rounded-card border border-line bg-vessel px-3 py-2.5 text-left font-mono text-sm text-ink transition-all duration-150 hover:border-accent hover:text-accent active:scale-[0.98] disabled:opacity-50"
                >
                  {busyId === s.id ? "Judging…" : s.label}
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
          <span className="flex items-baseline gap-4">
            <span className="font-mono text-xs text-ink-3">
              {feed.length} {feed.length === 1 ? "entry" : "entries"}
            </span>
            {feed.length > 0 && (
              <button
                onClick={clearFeed}
                className="font-mono text-xs text-ink-3 underline decoration-line underline-offset-4 transition-colors duration-150 hover:text-deny"
              >
                clear
              </button>
            )}
          </span>
        </div>

        {error && (
          <p role="alert" className="rounded-card border border-deny bg-panel px-4 py-3 text-sm text-deny">
            {error}
          </p>
        )}

        {feed.length === 0 && (
          <div className="rounded-card border border-dashed border-line px-6 py-10 text-center">
            <p className="text-sm text-ink-2">No orders checked yet.</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-ink-3">
              {mode === "LIVE"
                ? "Propose any order on the left: Assay prices it against the real book and judges it before Binance ever sees it."
                : "See it work in one click: a 1,000 USDC meme order meets the 2% cap and the allowlist."}
            </p>
            {mode === "REPLAY" && (
              <button
                onClick={() => runReplay("yolo-doge")}
                disabled={busy}
                className="mt-4 rounded-card bg-accent-bright px-4 py-2 font-mono text-xs font-semibold tracking-wide text-on-accent transition-all duration-150 hover:bg-accent active:scale-[0.98] disabled:opacity-50"
              >
                {busyId === "yolo-doge" ? "Judging…" : "Run the YOLO scenario"}
              </button>
            )}
            <div className="mx-auto mt-6 grid max-w-sm gap-2 opacity-40" aria-hidden>
              <div className="h-4 w-1/3 rounded-sm bg-vessel" />
              <div className="h-8 w-full rounded-sm bg-vessel" />
              <div className="h-3 w-2/3 rounded-sm bg-vessel" />
            </div>
          </div>
        )}

        {feed.map((f) => {
          const shareId = btoa(JSON.stringify({ s: f.order.symbol, n: f.order.notional, r: rules.maxTradePct }))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
          return (
            <div key={f.serial} className="grid gap-2">
              <DocketCard
                serial={`${f.serial} · ${f.at}${f.scenario ? ` · ${f.scenario}` : ""}`}
                verdict={f.verdict}
                symbol={f.order.symbol}
                notional={f.order.notional}
                price={f.price}
                transcriptHash={f.transcriptHash}
                entryHash={f.entryHash}
                mode={f.mode}
                animate
              />
              <a
                href={`/d/${shareId}`}
                className="w-fit font-mono text-[11px] text-ink-3 underline decoration-line underline-offset-4 transition-colors duration-150 hover:text-accent"
              >
                public link: this verdict, re-judged live
              </a>
            </div>
          );
        })}
      </section>
    </div>
  );
}
