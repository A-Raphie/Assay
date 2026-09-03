import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-4 px-6">
        <p className="font-mono text-xs text-ink-3">assay · built by Raphie for the Binance Agent OS Mini Hackathon</p>
        <div className="flex gap-6 font-mono text-xs">
          <Link href="/desk" className="text-ink-2 hover:text-accent">desk</Link>
          <Link href="/rules" className="text-ink-2 hover:text-accent">rules</Link>
          <a href="https://github.com/A-Raphie/assay" target="_blank" rel="noreferrer" className="text-ink-2 hover:text-accent">
            github
          </a>
        </div>
      </div>
    </footer>
  );
}
