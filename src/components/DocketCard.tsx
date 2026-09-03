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
  entryHash,
  mode,
  animate,
}: {
  serial: string;
  verdict: Verdict;
  symbol: string;
  notional: number;
  price?: { symbol: string; lastPrice: string; changePct: string };
  transcriptHash?: string;
  entryHash?: string;
  mode: "LIVE" | "REPLAY";
  animate?: boolean;
}) {
  const style = STATE_STYLE[verdict.action];
  const showStamp = verdict.action !== "PASS";
  const finalNotional = verdict.adjustedNotional ?? notional;
  const trustLine = entryHash
    ? `entry sha256 ${entryHash.slice(0, 12)}…`
    : transcriptHash
      ? `transcript sha256 ${transcriptHash.slice(0, 12)}…`
      : "";
  return (
    <article
      data-testid="docket-card"
      data-state={verdict.action}
      className="relative overflow-hidden rounded-card border border-line bg-panel p-5 card-depth card-hover"
    >
      <header className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-ink-3">{serial}</span>
        {showStamp ? (
          <span
            aria-hidden
            className={`rounded-stamp border-2 px-2.5 py-0.5 font-mono text-sm font-bold tracking-[0.15em] sm:absolute sm:right-6 sm:top-6 sm:rotate-[-7deg] sm:text-base sm:tracking-[0.2em] ${
              verdict.action === "RESIZE" ? "border-accent text-accent" : "border-deny text-deny"
            } ${animate ? "stamp-animate" : ""}`}
          >
            {verdict.action}
          </span>
        ) : (
          <span
            aria-hidden
            className={`rounded-stamp border-2 px-2.5 py-0.5 font-mono text-sm font-bold tracking-[0.15em] rotate-[-3deg] ${style.chip} ${animate ? "stamp-animate" : ""}`}
          >
            PASS
          </span>
        )}
      </header>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {symbol} · <span className="whitespace-nowrap">{verdict.action === "RESIZE" ? finalNotional.toFixed(2) : notional.toFixed(2)} USDC</span>
        </h3>
        {verdict.action === "RESIZE" && (
          <s className="font-mono text-sm text-ink-3 tabular-nums">{notional.toFixed(2)}</s>
        )}
      </div>

      {price && (
        <p className="mt-1 font-mono text-xs text-ink-2 tabular-nums">
          {price.symbol} @ {price.lastPrice}
          {price.changePct !== "" && ` · 24h ${price.changePct}%`}
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-balance">
        {verdict.citation ? `${verdict.citation} · ` : ""}
        <span className="text-ink-2">{verdict.reason}</span>
      </p>

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="font-mono text-[11px] text-ink-3">{mode}</span>
        <span className="font-mono text-[11px] text-ink-3">{trustLine}</span>
      </footer>
    </article>
  );
}
