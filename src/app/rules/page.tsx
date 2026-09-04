"use client";

import { RulesEditor, StampPlate, useRules } from "@/components/RulesForm";
import { SiteFooter } from "@/components/SiteFooter";
import Link from "next/link";

export default function RulesPage() {
  const [rules, update, savedAt] = useRules();
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col px-6 pb-10">
      <nav className="flex items-baseline justify-between pt-10">
        <Link href="/" className="font-mono text-sm text-ink-2 hover:text-accent">
          Assay
        </Link>
        <div className="flex items-baseline gap-6">
          <Link href="/try" className="font-mono text-sm text-ink-2 transition-colors duration-150 hover:text-accent">
            try
          </Link>
          <Link href="/desk" className="font-mono text-sm text-ink-2 transition-colors duration-150 hover:text-accent">
            desk
          </Link>
          <span className="font-mono text-sm text-accent" aria-current="page">
            rules
          </span>
        </div>
      </nav>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Your rules</h1>
        <p
          role="status"
          className={`font-mono text-xs transition-opacity duration-500 ${savedAt ? "text-pass opacity-100" : "opacity-0"}`}
        >
          Saved · applies to the next check
        </p>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
        Three rules, judged on every order before it reaches Binance. Saved in this browser only.
      </p>

      <div className="mt-8 grid items-start gap-4 sm:grid-cols-[1fr_260px]">
        <div className="rounded-card border border-line bg-panel p-6">
          <RulesEditor rules={rules} onChange={update} />
        </div>
        <StampPlate rules={rules} />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-3">
        Spot orders only in this build. Margin and futures semantics (leverage, liquidation) are out
        of scope by design: a cap that lies is worse than no cap.
      </p>

      <div className="mt-auto pt-12">
        <SiteFooter />
      </div>
    </main>
  );
}
