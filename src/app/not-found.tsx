import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-content-center px-6 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-accent">VERDICT: BLOCKED</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">This page is not on the allowlist.</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        Rule 3 struck again. The page you asked for does not exist here.
      </p>
      <Link
        href="/"
        className="mx-auto mt-8 w-fit rounded-card bg-accent-bright px-5 py-2.5 font-mono text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent active:scale-[0.98]"
      >
        Back to the front door
      </Link>
    </main>
  );
}
