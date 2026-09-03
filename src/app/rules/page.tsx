"use client";

import { RulesEditor, useRules } from "@/components/RulesForm";
import Link from "next/link";

export default function RulesPage() {
  const [rules, update] = useRules();
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24">
      <nav className="flex items-baseline justify-between pt-10">
        <Link href="/" className="font-mono text-sm text-ink-2 hover:text-accent">
          assay
        </Link>
        <Link href="/desk" className="font-mono text-sm text-accent hover:underline">
          desk →
        </Link>
      </nav>

      <h1 className="mt-10 text-4xl font-bold tracking-tight">Your rules</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
        Three rules, judged on every order before it reaches Binance. Saved in this browser only.
      </p>

      <div className="mt-8 rounded-card border border-line bg-panel p-6">
        <RulesEditor rules={rules} onChange={update} />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-3">
        Spot orders only in this build. Margin and futures semantics (leverage, liquidation) are out
        of scope by design: a cap that lies is worse than no cap.
      </p>
    </main>
  );
}
