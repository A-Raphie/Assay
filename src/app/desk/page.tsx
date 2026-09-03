import Link from "next/link";
import { Desk } from "@/components/Desk";

export const metadata = { title: "Desk · Assay" };

export default function DeskPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <nav className="flex items-baseline justify-between pt-10">
        <Link href="/" className="font-mono text-sm text-ink-2 hover:text-accent">
          assay
        </Link>
        <div className="flex items-baseline gap-6">
          <Link href="/rules" className="font-mono text-sm text-accent hover:underline">
            rules
          </Link>
          <span className="font-mono text-sm text-ink-3">desk</span>
        </div>
      </nav>

      <h1 className="mt-10 text-4xl font-bold tracking-tight">The desk</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
        Every order, judged before it reaches Binance. REPLAY runs the exact LIVE engine over
        hash-verified recorded market data.
      </p>

      <div className="mt-8">
        <Desk />
      </div>
    </main>
  );
}
