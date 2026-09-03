/**
 * Binance MCP client: JSON-RPC 2.0 over streamable HTTP.
 * Every request/response pair is appended to a transcript (JSONL + sha256)
 * so REPLAY mode can re-run the identical engine against real data.
 */

import { createHash } from "node:crypto";

export const MCP_URL = "https://agent.binance.com/mcp/agentic";

export interface TranscriptEntry {
  ts: string;
  tool: string;
  argsJson: string;
  responseSha256: string;
  responseJson: string;
  mode: "LIVE" | "REPLAY";
}

let nextId = 1;

export class BinanceMcp {
  private token: string;
  private sessionLine: string[] = [];
  private initialized = false;
  public transcript: TranscriptEntry[] = [];

  constructor(token: string) {
    this.token = token;
  }

  private async rpc(method: string, params: unknown, record = true): Promise<any> {
    const id = nextId++;
    const body = JSON.stringify({ jsonrpc: "2.0", id, method, params });
    const res = await fetch(MCP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        Authorization: `Bearer ${this.token}`,
      },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      throw new Error(`MCP ${method} failed: HTTP ${res.status} ${await res.text().catch(() => "")}`);
    }
    const text = await res.text();
    // Streamable HTTP may answer as SSE (data: lines) or plain JSON.
    const payload = text.startsWith("event:") || text.startsWith("data:")
      ? JSON.parse(text.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join(""))
      : JSON.parse(text);
    if (record) this.record(method === "tools/call" ? String((params as any)?.name ?? method) : method, body, text);
    if (payload.error) throw new Error(`MCP ${method} error ${payload.error.code}: ${payload.error.message}`);
    return payload.result;
  }

  private record(tool: string, argsJson: string, responseJson: string) {
    this.transcript.push({
      ts: new Date().toISOString(),
      tool,
      argsJson,
      responseSha256: createHash("sha256").update(responseJson).digest("hex"),
      responseJson,
      mode: "LIVE",
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "assay", version: "0.1.0" },
    });
    await this.rpc("notifications/initialized", {}, false);
    this.initialized = true;
  }

  async listTools(): Promise<string[]> {
    await this.initialize();
    const result = await this.rpc("tools/list", {});
    return (result?.tools ?? []).map((t: any) => t.name);
  }

  /** Search the server's tool catalog by category (market, account, trade, ...). */
  async searchTools(category: string): Promise<any[]> {
    await this.initialize();
    const result = await this.rpc("tools/call", { name: "tool_search", arguments: { category } });
    const inner = JSON.parse(result.content[0].text);
    return inner.tools ?? [];
  }

  /** Execute a wrapped Binance API tool, e.g. spot.ticker24hr. */
  async execute(toolName: string, args: Record<string, unknown> = {}): Promise<any> {
    await this.initialize();
    const result = await this.rpc("tools/call", { name: "tool_execute", arguments: { toolName, arguments: args } });
    if (result?.isError) throw new Error(`tool ${toolName} failed: ${result.content?.[0]?.text ?? "unknown"}`);
    const text = result.content?.[0]?.text ?? "{}";
    try {
      return { structured: result.structuredContent ?? JSON.parse(text), raw: result };
    } catch {
      return { structured: text, raw: result };
    }
  }

  /** Session transcript in JSONL form. */
  transcriptJsonl(): string {
    return this.transcript.map((e) => JSON.stringify(e)).join("\n");
  }
}
