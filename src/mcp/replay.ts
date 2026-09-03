/**
 * REPLAY mode: feed a recorded, hash-stamped MCP transcript through the same
 * engine as LIVE. No network, no fake values: every response carries the
 * sha256 of the real recorded payload, rendered in the UI.
 */

import { createHash } from "node:crypto";
import type { TranscriptEntry } from "./binance";

export interface ReplayFrame {
  tool: string;
  argsJson: string;
  responseJson: string;
  responseSha256: string;
  /** Recomputed at replay time; must match responseSha256 for the frame to be trusted. */
  verified: boolean;
  ts: string;
}

export function verifyTranscript(entries: TranscriptEntry[]): ReplayFrame[] {
  return entries.map((e) => {
    const hash = createHash("sha256").update(e.responseJson).digest("hex");
    return {
      tool: e.tool,
      argsJson: e.argsJson,
      responseJson: e.responseJson,
      responseSha256: e.responseSha256,
      verified: hash === e.responseSha256,
      ts: e.ts,
    };
  });
}

export function parseTranscriptJsonl(text: string): ReplayFrame[] {
  const entries = text
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as TranscriptEntry);
  return verifyTranscript(entries);
}

export function transcriptToJsonl(frames: ReplayFrame[]): string {
  return frames
    .map((f) =>
      JSON.stringify({
        ts: f.ts,
        tool: f.tool,
        argsJson: f.argsJson,
        responseSha256: f.responseSha256,
        responseJson: f.responseJson,
        mode: "REPLAY",
      }),
    )
    .join("\n");
}
