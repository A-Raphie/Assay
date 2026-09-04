import Link from "next/link";
import { TryBox } from "@/components/TryBox";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Try it · Assay" };

export default function TryPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-6 pb-16">
      <nav className="flex items-baseline justify-between pt-8">
        <Link href="/" className="font-mono text-sm text-ink-2 hover:text-accent">
          Assay
        </Link>
        <div className="flex items-baseline gap-6">
          <Link href="/desk" className="font-mono text-sm text-ink-2 transition-colors duration-150 hover:text-accent">
            desk
          </Link>
          <Link href="/rules" className="font-mono text-sm text-ink-2 transition-colors duration-150 hover:text-accent">
            rules
          </Link>
          <span className="font-mono text-sm text-accent" aria-current="page">
            try
          </span>
        </div>
      </nav>

      <h1 className="mt-10 text-4xl font-bold tracking-tight">Judge an order.</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
        The one job, right here: pick a symbol and an amount, and Assay judges it against the real
        recorded price with the same engine the desk uses.
      </p>

      <div className="mt-8">
        <TryBox />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-3">
        Want it connected to your actual agent instead? That is the{" "}
        <Link href="/#connect" className="text-accent hover:underline">
          connect-your-agent
        </Link>{" "}
        path: three rules in your browser, one MCP endpoint in your agent.
      </p>

      <SiteFooter />
    </main>
  );
}
