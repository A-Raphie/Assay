"use client";

import { useState } from "react";

const CONFIG = `{
  "mcpServers": {
    "binance-mcp-server": {
      "url": "https://agent.binance.com/mcp/agentic"
    },
    "assay": {
      "url": "https://tryassay.vercel.app/api/verdict",
      "note": "judge every order here before spot.newOrder"
    }
  }
}`;

export function ConnectSteps() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONFIG);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: user selects manually */
    }
  };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { n: "1", title: "Write your three rules", body: "Cap, halt, allowlist. This page, 30 seconds, saved in your browser." },
        { n: "2", title: "Copy the config into your agent", body: "Claude Code, Codex, ChatGPT, VS Code: paste the snippet below into your MCP settings." },
        { n: "3", title: "Route every order through the check", body: "Your agent calls the verdict endpoint before spot.newOrder. Blocked orders never reach Binance." },
      ].map((s) => (
        <div key={s.n} className="rounded-card border border-line bg-panel p-6 card-depth card-hover">
          <span className="font-mono text-xs text-accent">{s.n}</span>
          <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
        </div>
      ))}
      <div className="relative md:col-span-3 rounded-card border border-line bg-vessel p-4 card-depth">
        <button
          onClick={copy}
          className="absolute right-3 top-3 rounded-stamp border border-line px-2.5 py-1 font-mono text-[11px] text-ink-2 transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          {copied ? "copied" : "copy"}
        </button>
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-ink">{CONFIG}</pre>
      </div>
    </div>
  );
}
