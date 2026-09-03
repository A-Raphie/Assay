import Link from "next/link";

const STEPS = [
  {
    n: "1",
    title: "Write your rules",
    body: "A cap per trade, a daily loss halt, an allowlist. Three rules, saved in your browser.",
  },
  {
    n: "2",
    title: "Point your agent at Assay",
    body: "Every order your agent proposes gets priced against the real book and judged before Binance sees it.",
  },
  {
    n: "3",
    title: "Read the docket",
    body: "Passed, resized, blocked, halted: every verdict cites the rule that fired, with the transcript hash attached.",
  },
];

export default function FrontDoor() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <section className="pt-20 pb-14 md:pt-28">
        <p className="font-mono text-xs tracking-[0.3em] text-accent">THE CHECK BEFORE THE ORDER</p>
        <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          This is Assay,
          <br />
          the check every Binance
          <br />
          agent order must pass.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
          Binance Agent OS lets AI agents trade your sub-account through MCP. Assay sits between the
          agent and the exchange: oversized orders get cut to your cap, forbidden ones get stopped,
          and every verdict cites the rule that fired. In plain words, with proof attached.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/desk"
            className="rounded-card bg-accent-bright px-6 py-3 font-mono text-sm font-semibold tracking-wide text-on-accent hover:bg-accent"
          >
            Enter the desk
          </Link>
          <Link href="/rules" className="font-mono text-sm text-accent hover:underline">
            set your rules first
          </Link>
        </div>
      </section>

      <section aria-label="How it works" className="grid gap-4 border-t border-line py-12 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-card border border-line bg-panel p-6">
            <span className="font-mono text-xs text-accent">{s.n}</span>
            <h2 className="mt-2 text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-line py-12">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">THE THREE RULES, AS SHIPPED</h2>
        <ul className="mt-4 grid gap-2 font-mono text-sm text-ink">
          <li className="rounded-card border border-line bg-panel px-4 py-3">1 · max 2% of sub-account equity per trade · over that, the order is resized down</li>
          <li className="rounded-card border border-line bg-panel px-4 py-3">2 · 5% daily loss halts every order until the 00:00 UTC reset</li>
          <li className="rounded-card border border-line bg-panel px-4 py-3">3 · BTC · ETH · BNB by default · anything else is blocked on sight</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          Defaults, not doctrine: every number is yours to change on the rules page.
        </p>
      </section>

      <section className="border-t border-line py-12">
        <h2 className="font-mono text-sm tracking-widest text-ink-2">WORKS WITH</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Binance Agent OS · the Binance MCP Server (agent.binance.com/mcp/agentic) · Claude Code,
          Codex, ChatGPT, VS Code · any agent that speaks MCP.
        </p>
      </section>
    </main>
  );
}
