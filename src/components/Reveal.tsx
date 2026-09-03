"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll reveal per landing-page-design B7: IntersectionObserver, heavy fade-up,
 * custom bezier, runs once. No scroll listeners.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    // In-viewport at mount: show synchronously. Never gate above-the-fold
    // content behind the observer (a missed IO callback blanks the hero).
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * B11 tagline reveal: each word activates from muted to full ink as the
 * section crosses the viewport, in reading order.
 */
export function TaglineReveal({ words }: { words: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(words.split(" ").length);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const total = words.split(" ").length;
            let i = 0;
            const tick = () => {
              i += 1;
              setActive(i);
              if (i < total) setTimeout(tick, 90);
            };
            tick();
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [words]);

  return (
    <p
      ref={ref}
      className="max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
    >
      {words.split(" ").map((w, i) => (
        <span
          key={i}
          className="transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ color: i < active ? "var(--ink)" : "color-mix(in srgb, var(--ink) 45%, transparent)" }}
        >
          {w}{" "}
        </span>
      ))}
    </p>
  );
}
