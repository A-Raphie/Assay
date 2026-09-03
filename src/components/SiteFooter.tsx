import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-10">
      <div className="flex w-full flex-wrap items-baseline justify-between gap-4">
        <p className="font-mono text-xs text-ink-3">
          Assay · built by{" "}
          <a
            href="https://x.com/a_raphie"
            target="_blank"
            rel="noreferrer"
            className="text-ink-2 underline decoration-line underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent"
          >
            Raphie
          </a>{" "}
          for the Binance Agent OS Mini Hackathon
        </p>
        <div className="flex gap-6 font-mono text-xs">
          <Link href="/desk" className="text-ink-2 hover:text-accent">desk</Link>
          <Link href="/rules" className="text-ink-2 hover:text-accent">rules</Link>
          <a href="https://github.com/A-Raphie/Assay" target="_blank" rel="noreferrer" className="text-ink-2 hover:text-accent">
            github
          </a>
        </div>
      </div>
    </footer>
  );
}
