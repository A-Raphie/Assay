import type { Verdict } from "@/engine/rules";

const STATE_STYLE: Record<Verdict["action"], { chip: string; word: string }> = {
  PASS: { chip: "border-pass text-pass", word: "PASSED" },
  RESIZE: { chip: "border-accent text-accent", word: "RESIZED" },
  BLOCK: { chip: "border-deny text-deny", word: "BLOCKED" },
  HALT: { chip: "border-deny text-deny", word: "HALTED" },
};

export function DocketCard({
  serial,
  verdict,
  symbol,
  notional,
  price,
  transcriptHash,
  mode,
  animate,
}: {
  serial: string;
  verdict: Verdict;
  symbol: string;
  notional: number;
  price?: { symbol: string; lastPrice: string; changePct: string };
  transcriptHash?: string;
  mode: "LIVE" | "REPLAY";
  animate?: boolean;
}) {
  const style = STATE_STYLE[verdict.action];
  const showStamp = verdict.action !== "PASS";
  const finalNotional = verdict.adjustedNotional ?? notional;
  return (
    <article
      data-testid="docket-card"
      data-state={verdict.action}
      className="relative overflow-hidden rounded-card border border-line bg-panel p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-xs text-ink-3">{serial}</span>
        <span className={`rounded-stamp border px-2 py-0.5 font-mono text-[11px] tracking-widest ${style.chip}`}>
          {style.word}
        </span>
      </header>

      <div className="mt-3 flex items-baseline gap-3">
        <h3 className="text-2xl font-semibold tracking-tight">
          {symbol} · {verdict.action === "RESIZE" ? finalNotional.toFixed(2) : notional.toFixed(2)} USDC
        </h3>
        {verdict.action === "RESIZE" && (
          <s className="font-mono text-sm text-ink-3">{notional.toFixed(2)}</s>
        )}
      </div>

      {price && (
        <p className="mt-1 font-mono text-xs text-ink-2">
          {price.symbol} @ {price.lastPrice}
          {price.changePct !== "" && ` · 24h ${price.changePct}%`}
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-ink">
        {verdict.citation ? `${verdict.citation} · ` : ""}
        <span className="text-ink-2">{verdict.reason}</span>
      </p>

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="font-mono text-[11px] text-ink-3">
          {mode}
          {transcriptHash ? ` · sha256 ${transcriptHash.slice(0, 12)}…` : ""}
        </span>
        <span className="font-mono text-[11px] text-ink-3">assay office record</span>
      </footer>

      {showStamp && (
        <span
          aria-hidden
          className={`stamp-strike pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-[-8deg] rounded-stamp border-2 px-3 py-1 font-mono text-lg font-bold tracking-[0.2em] ${
            verdict.action === "RESIZE" ? "border-accent text-accent" : "border-deny text-deny"
          } ${animate ? "stamp-animate" : ""}`}
        >
          {verdict.action}
        </span>
      )}
    </article>
  );
}
