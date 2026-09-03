"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surfaced in Vercel logs; nothing user-facing leaks.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-2xl place-content-center px-6 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-deny-text">VERDICT: HALTED</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Something broke on our side.</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        The check hit an error it did not expect. Nothing was traded. Try again.
      </p>
      <button
        onClick={reset}
        className="mx-auto mt-8 w-fit rounded-card bg-accent-bright px-5 py-2.5 font-mono text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent active:scale-[0.98]"
      >
        Retry
      </button>
    </main>
  );
}
