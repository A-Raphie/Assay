import Link from "next/link";
import { DocketCard } from "@/components/DocketCard";
import { Reveal, TaglineReveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { heroProof } from "@/lib/proof";

const STEPS = [
  {
    n: "1",
    title: "Write three rules",
    body: "A cap per trade, a daily loss halt, an allowlist. Saved in your browser, cited on every verdict.",
  },
  {
    n: "2",
    title: "Point your agent at it",
    body: "Every order the agent proposes is priced against the real book and judged before Binance ever sees it.",
  },
  {
    n: "3",
    title: "Read the docket",
    body: "Passed, resized, blocked, halted: each verdict cites the rule that fired, with the transcript hash attached.",
  },
];

const RULES = [
  { id: "Rule 1", name: "Per-trade cap", line: "Max 2% of sub-account equity per order. Over the cap, the order is resized down, never dropped silently." },
  { id: "Rule 2", name: "Daily halt", line: "Down 5% on the day, every order stops until the 00:00 UTC reset. Halts outrank everything." },
  { id: "Rule 3", name: "Allowlist", line: "BTC, ETH, BNB by default. Anything else is blocked on sight, however confident the agent sounds." },
];

const WORKS_WITH = ["Binance Agent OS", "agent.binance.com/mcp/agentic", "Claude Code", "Codex", "ChatGPT", "VS Code"];

export default function FrontDoor() {
  const proof = heroProof();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 pb-0">
      {/* Hero: claim + real product proof side by side */}
      <section className="grid items-center gap-10 pb-16 pt-16 md:pt-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-accent">AGENT ORDERS, JUDGED BEFORE BINANCE SEES THEM</p>
          <h1 className="mt-4 max-w-[680px] text-balance bg-gradient-to-r from-white to-[#9b9b9b] bg-clip-text text-5xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-6xl">
            Let your AI agent trade without handing it the keys.
          </h1>
          <p className="mt-6 max-w-[680px] text-pretty text-lg leading-relaxed text-ink-2">
            Assay checks every order your agent proposes through the Binance MCP Server against
            three rules you own: a per-trade cap, a daily loss halt, an allowlist. Oversized orders
            get cut, forbidden ones get stopped, and every verdict cites the rule that fired with
            proof attached.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/desk"
              className="rounded-card bg-accent-bright px-6 py-3 font-mono text-sm font-semibold tracking-wide text-on-accent transition-transform duration-150 hover:bg-accent active:scale-[0.98]"
            >
              Enter the desk
            </Link>
            <Link href="/rules" className="font-mono text-sm text-accent hover:underline">
              set your rules first
            </Link>
          </div>
        </div>

        {/* The proof: a real verdict from the committed transcript, same engine as the desk */}
        <Reveal delay={150}>
          {proof ? (
            <figure className="grid gap-2">
              <DocketCard
                serial="ASSAY-0000 · live sample"
                verdict={proof.verdict}
                symbol={proof.order.symbol}
                notional={proof.order.notional}
                price={proof.price}
                transcriptHash={proof.transcriptHash}
                mode="REPLAY"
              />
              <figcaption className="px-1 font-mono text-[11px] text-ink-3">
                Rendered at page load from the committed transcript: the same engine, the same
                recorded price, judged fresh.
              </figcaption>
            </figure>
          ) : (
            <div className="rounded-card border border-dashed border-line p-8 text-sm text-ink-3">
              Sample unavailable: transcript not found in this deployment.
            </div>
          )}
        </Reveal>
      </section>

      {/* Tagline reveal (B11) */}
      <section className="border-t border-line py-20 sm:py-24">
        <TaglineReveal words="An agent that cannot explain an order should not place it. Assay makes the explanation the product." />
      </section>

      {/* The problem, with numbers: same prompt, two outcomes */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">ONE PROMPT, TWO OUTCOMES</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          An agent is told to deploy 1,000 USDC into a memecoin. Paper equity: 1,000 USDC on both
          sides. This is a real recorded session, not a story:
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-deny/60 bg-panel p-6">
            <p className="font-mono text-xs tracking-widest text-deny-text">RAW MCP</p>
            <p className="mt-3 text-3xl font-bold tabular-nums">1,000.00 <span className="text-base font-medium text-ink-2">USDC out the door</span></p>
            <ul className="mt-4 grid gap-1.5 text-sm text-ink-2">
              <li>0 checks between the prompt and the fill</li>
              <li>no allowlist, no cap, no receipt</li>
              <li>the agent's word is the only record</li>
            </ul>
          </div>
          <div className="rounded-card border border-pass/60 bg-panel p-6">
            <p className="font-mono text-xs tracking-widest text-pass">THROUGH ASSAY</p>
            <p className="mt-3 text-3xl font-bold tabular-nums">0.00 <span className="text-base font-medium text-ink-2">USDC out the door</span></p>
            <ul className="mt-4 grid gap-1.5 text-sm text-ink-2">
              <li>blocked on sight: DOGE is not on the allowlist</li>
              <li>verdict cites Rule 3, word for word</li>
              <li>sha256 of the exact MCP response on the card</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-label="How it works" className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">HOW IT WORKS</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="h-full rounded-card border border-line bg-panel p-6 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-ink-3">
                <span className="font-mono text-xs text-accent">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The rules, as spec */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">THE THREE RULES, AS SHIPPED</h2>
        <dl className="mt-6 grid gap-3">
          {RULES.map((r, i) => (
            <Reveal key={r.id} delay={i * 80}>
              <div className="grid gap-1 rounded-card border border-line bg-panel px-5 py-4 sm:grid-cols-[110px_1fr] sm:gap-6">
                <dt className="font-mono text-sm font-semibold text-accent">{r.id}</dt>
                <dd className="text-sm leading-relaxed text-ink-2">
                  <span className="font-semibold text-ink">{r.name}.</span> {r.line}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
        <p className="mt-4 text-sm text-ink-3">Defaults, not doctrine: every number is yours to change on the rules page.</p>
      </section>

      {/* Works with */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">WORKS WITH</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {WORKS_WITH.map((w) => (
            <li key={w} className="rounded-stamp border border-line bg-panel px-3 py-1.5 font-mono text-xs text-ink-2">
              {w}
            </li>
          ))}
        </ul>
      </section>

      {/* Judge proof: curl-able verdict */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">JUDGE IT YOURSELF, NO UI REQUIRED</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          The verdict endpoint runs the same engine over the same committed transcript. Judge any
          order from a terminal:
        </p>
        <div className="mt-4 overflow-x-auto rounded-card border border-line bg-vessel p-4">
          <code className="font-mono text-xs leading-relaxed text-ink whitespace-nowrap">
            curl -s "https://assay-psi-one.vercel.app/api/verdict?symbol=DOGEUSDT&notional=1000" | jq
          </code>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-3">
          Returns the recorded price, its sha256, and the verdict JSON. Change notional, change the
          verdict: 50 into BTC passes, 100 into BTC resizes to your cap.
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">STRAIGHT ANSWERS</h2>
        <dl className="mt-6 grid gap-5">
          {[
            ["Can Assay move my funds?", "No. It holds no keys and takes no custody: it rides the Binance MCP Server's permission model, where the withdrawal scope does not exist. LIVE verdicts stop before the execute call."],
            ["Is the REPLAY data real?", "Yes: recorded MCP responses, sha256-stamped, re-verified on every load. The only declared number is the paper equity, and it says so on screen."],
            ["Which agents work with it?", "Any of them. Claude Code, Codex, ChatGPT, VS Code: if it speaks MCP, its orders can be judged. Assay is a check, not a framework."],
            ["What happens when a rule fires?", "The order is resized, blocked, or halted, and the docket card cites the rule in your own words with the transcript hash attached."],
          ].map(([q, a]) => (
            <div key={q} className="grid gap-1.5">
              <dt className="text-sm font-semibold text-ink">{q}</dt>
              <dd className="text-sm leading-relaxed text-ink-2">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line py-16 text-center">
        <p className="text-2xl font-semibold tracking-tight">See it judge an order in twenty seconds.</p>
        <Link
          href="/desk"
          className="mt-6 inline-block rounded-card bg-accent-bright px-6 py-3 font-mono text-sm font-semibold tracking-wide text-on-accent transition-transform duration-150 hover:bg-accent active:scale-[0.98]"
        >
          Enter the desk
        </Link>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
