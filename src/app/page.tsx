import Link from "next/link";
import { DocketCard } from "@/components/DocketCard";
import { Reveal, TaglineReveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { LiveTicker } from "@/components/LiveTicker";
import { Sparkline } from "@/components/Sparkline";
import { TryBox } from "@/components/TryBox";
import { ConnectSteps } from "@/components/ConnectSteps";
import { heroProof } from "@/lib/proof";

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
      {/* Mono status strip: live · source */}
      <div className="flex items-center gap-4 border-b border-line py-3 font-mono text-[11px] tracking-widest text-ink-3">
        <span className="flex items-center gap-2">
          <span className="dot-live" /> live
        </span>
        <span>·</span>
        <span>binance mcp server</span>
        <span>·</span>
        <span>spot · replay transcript</span>
      </div>

      {/* Hero: outcome headline + live instrument + proof card */}
      <section className="grid items-center gap-10 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="max-w-[680px] text-balance bg-gradient-to-r from-white to-[#9b9b9b] bg-clip-text text-5xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-6xl">
            Let your AI agent trade without handing it the keys.
          </h1>
          <p className="mt-6 max-w-[680px] text-pretty text-lg leading-relaxed text-ink-2">
            Assay checks every order your agent proposes through the binance mcp server against
            three rules you own: a per-trade cap, a daily loss halt, an allowlist. oversized orders
            get cut, forbidden ones get stopped, and every verdict cites the rule that fired with
            proof attached.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/desk"
              className="rounded-card bg-accent-bright px-6 py-3 font-mono text-sm font-semibold tracking-wide text-on-accent transition-all duration-150 hover:bg-accent hover:shadow-[0_0_20px_var(--glow-accent)] active:scale-[0.98]"
            >
              Judge an order now
            </Link>
            <Link href="/rules" className="font-mono text-sm text-accent hover:underline">
              set your rules first
            </Link>
          </div>
        </div>

        {/* Live instrument: hero number + sparkline + real proof card */}
        <Reveal delay={100}>
          <div className="grid gap-4">
            <div className="rounded-card border border-line bg-panel p-6 card-depth">
              <div className="flex items-start justify-between gap-4">
                <LiveTicker symbol="BTCUSDT" />
                <Sparkline symbol="BTCUSDT" className="w-40 h-12 shrink-0" />
              </div>
              <p className="mt-3 font-mono text-[11px] text-ink-3">
                the price your agent would trade at, right now · 24h closes
              </p>
            </div>
            {proof && (
              <DocketCard
                serial="live sample · judged at page load"
                verdict={proof.verdict}
                symbol={proof.order.symbol}
                notional={proof.order.notional}
                price={proof.price}
                transcriptHash={proof.transcriptHash}
                mode="REPLAY"
              />
            )}
          </div>
        </Reveal>
      </section>

      {/* Try box: do the one job in five seconds */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">DO THE ONE JOB RIGHT HERE</h2>
        <div className="mt-6">
          <TryBox />
        </div>
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
          <div className="rounded-card border border-deny/60 bg-panel p-6 card-depth">
            <p className="font-mono text-xs tracking-widest text-deny-text">RAW MCP</p>
            <p className="mt-3 number-xl tabular-nums">1,000.00</p>
            <p className="mt-1 text-sm text-ink-2">USDC out the door</p>
            <ul className="mt-4 grid gap-1.5 text-sm text-ink-2">
              <li>0 checks between the prompt and the fill</li>
              <li>no allowlist, no cap, no receipt</li>
              <li>the agent's word is the only record</li>
            </ul>
          </div>
          <div className="rounded-card border border-pass/60 bg-panel p-6 card-depth">
            <p className="font-mono text-xs tracking-widest text-pass">THROUGH Assay</p>
            <p className="mt-3 number-xl tabular-nums">0.00</p>
            <p className="mt-1 text-sm text-ink-2">USDC out the door</p>
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
          {[
            { n: "1", title: "The agent proposes", body: "Your agent decides to trade and sizes an order through the Binance MCP Server." },
            { n: "2", title: "Assay prices and judges", body: "The order is priced against the real book and checked against your three rules before it is placed." },
            { n: "3", title: "You get the docket", body: "Passed, resized, blocked, halted: the rule that fired, in your words, with the hash attached." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="h-full rounded-card border border-line bg-panel p-6 card-depth card-hover">
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
              <div className="grid gap-1 rounded-card border border-line bg-panel px-5 py-4 card-depth sm:grid-cols-[110px_1fr] sm:gap-6">
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

      {/* Connect your agent */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">CONNECT YOUR AGENT</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          after you write your rules, this is the whole integration:
        </p>
        <div className="mt-6">
          <ConnectSteps />
        </div>
      </section>

      {/* Works with */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">WORKS WITH</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {WORKS_WITH.map((w) => (
            <li key={w} className="rounded-full border border-line bg-panel px-3.5 py-2 font-mono text-xs text-ink-2">
              {w}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="border-t border-line py-16">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">STRAIGHT ANSWERS</h2>
        <dl className="mt-6 grid gap-5">
          {[
            ["Can Assay move my funds?", "No. It holds no keys and takes no custody: it rides the binance mcp server's permission model, where the withdrawal scope does not exist. LIVE verdicts stop before the execute call."],
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
          className="mt-6 inline-block rounded-card bg-accent-bright px-6 py-3 font-mono text-sm font-semibold tracking-wide text-on-accent transition-all duration-150 hover:bg-accent hover:shadow-[0_0_20px_var(--glow-accent)] active:scale-[0.98]"
        >
          Enter the desk
        </Link>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
