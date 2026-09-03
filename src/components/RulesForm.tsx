"use client";

import { useEffect, useState } from "react";
import type { RuleSet } from "@/engine/rules";

export const DEFAULT_RULES: RuleSet = {
  maxTradePct: 2,
  dailyHaltPct: 5,
  allowlist: ["BTC", "ETH", "BNB"],
};

const KEY = "assay.rules.v1";

export function loadRules(): RuleSet {
  if (typeof window === "undefined") return DEFAULT_RULES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_RULES;
    const parsed = JSON.parse(raw) as RuleSet;
    return {
      maxTradePct: Number(parsed.maxTradePct) || DEFAULT_RULES.maxTradePct,
      dailyHaltPct: Number(parsed.dailyHaltPct) || DEFAULT_RULES.dailyHaltPct,
      allowlist: Array.isArray(parsed.allowlist) && parsed.allowlist.length ? parsed.allowlist : DEFAULT_RULES.allowlist,
    };
  } catch {
    return DEFAULT_RULES;
  }
}

export function saveRules(rules: RuleSet) {
  window.localStorage.setItem(KEY, JSON.stringify(rules));
  window.dispatchEvent(new Event("assay.rules.changed"));
}

export function useRules(): readonly [RuleSet, (r: RuleSet) => void, number | null] {
  const [rules, setRules] = useState<RuleSet>(DEFAULT_RULES);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setRules(loadRules());
    const sync = () => setRules(loadRules());
    window.addEventListener("assay.rules.changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("assay.rules.changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = (r: RuleSet) => {
    saveRules(r);
    setRules(r);
    setSavedAt(Date.now());
  };

  return [rules, update, savedAt] as const;
}

const inputCls =
  "w-28 rounded-card border border-line bg-vessel px-3 py-2 font-mono text-lg text-ink outline-none transition-colors duration-150 focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40";

export function RulesEditor({ rules, onChange }: { rules: RuleSet; onChange: (r: RuleSet) => void }) {
  const [chip, setChip] = useState("");
  const commitChip = () => {
    const v = chip.toUpperCase().trim();
    if (v && !rules.allowlist.includes(v)) onChange({ ...rules, allowlist: [...rules.allowlist, v] });
    setChip("");
  };
  return (
    <div className="grid gap-6">
      <label className="grid gap-2">
        <span className="text-sm text-ink-2">Rule 1 · max percent of equity per trade</span>
        <span className="flex items-center gap-3">
          <input
            type="number"
            min={0.1}
            max={100}
            step={0.1}
            value={rules.maxTradePct}
            onChange={(e) => onChange({ ...rules, maxTradePct: Number(e.target.value) })}
            className={inputCls}
          />
          <span className="font-mono text-sm text-ink-3">%</span>
        </span>
      </label>

      <label className="grid gap-2">
        <span className="text-sm text-ink-2">Rule 2 · halt all trading at daily loss</span>
        <span className="flex items-center gap-3">
          <input
            type="number"
            min={0.1}
            max={100}
            step={0.1}
            value={rules.dailyHaltPct}
            onChange={(e) => onChange({ ...rules, dailyHaltPct: Number(e.target.value) })}
            className={inputCls}
          />
          <span className="font-mono text-sm text-ink-3">%</span>
        </span>
      </label>

      <div className="grid gap-2">
        <span className="text-sm text-ink-2">Rule 3 · allowlist, base assets only</span>
        <span className="flex flex-wrap items-center gap-2">
          {rules.allowlist.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange({ ...rules, allowlist: rules.allowlist.filter((x) => x !== a) })}
              className="group rounded-stamp border border-line bg-vessel px-2.5 py-1 font-mono text-sm text-ink transition-colors duration-150 hover:border-deny hover:text-deny active:scale-[0.98]"
              title="Click to remove"
            >
              {a} <span className="text-ink-3 group-hover:text-deny">×</span>
            </button>
          ))}
          <input
            value={chip}
            onChange={(e) => setChip(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitChip()}
            onBlur={commitChip}
            placeholder="+ add"
            aria-label="Add allowlist asset"
            className="w-24 rounded-stamp border border-dashed border-line bg-transparent px-2.5 py-1 font-mono text-sm text-ink placeholder:text-ink-3 outline-none transition-colors duration-150 focus:border-accent"
          />
        </span>
      </div>
    </div>
  );
}

/** The rules exactly as verdicts will cite them. Live preview, same grammar as DocketCard. */
export function StampPlate({ rules }: { rules: RuleSet }) {
  return (
    <div className="rounded-card border border-line bg-vessel p-5">
      <p className="font-mono text-[11px] tracking-widest text-ink-3">YOUR STAMP PLATE</p>
      <ul className="mt-3 grid gap-2 font-mono text-sm text-ink">
        <li className="border-l-2 border-accent pl-3">Rule 1: max {rules.maxTradePct}% per trade</li>
        <li className="border-l-2 border-accent pl-3">Rule 2: halt at {rules.dailyHaltPct}% daily loss</li>
        <li className="border-l-2 border-accent pl-3">
          Rule 3: {rules.allowlist.length ? rules.allowlist.join(", ") : "nothing"} only
        </li>
      </ul>
      <p className="mt-3 font-mono text-[11px] text-ink-3">Every verdict on the desk cites these, word for word.</p>
    </div>
  );
}
