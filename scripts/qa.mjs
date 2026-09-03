#!/usr/bin/env node
/**
 * assay CLI-QA harness. Thin CLI over the deployed app's real endpoints.
 * Each subcommand = one user flow. Run against any environment:
 *   BASE=https://tryassay.vercel.app node scripts/qa.mjs smoke
 *   BASE=https://<preview>.vercel.app node scripts/qa.mjs all
 * Exit code 0 = every assertion passed. Kept in-repo as the regression net.
 */

const BASE = (process.env.BASE ?? "https://tryassay.vercel.app").replace(/\/$/, "");
let failures = 0;
let checks = 0;

function ok(name, cond, detail = "") {
  checks++;
  if (cond) {
    console.log(`  ok    ${name}`);
  } else {
    failures++;
    console.log(`  FAIL  ${name}${detail ? ` :: ${detail}` : ""}`);
  }
}

async function getJSON(path) {
  const res = await fetch(BASE + path);
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-json */
  }
  return { status: res.status, body };
}

async function getHTML(path) {
  const res = await fetch(BASE + path);
  const text = await res.text();
  return { status: res.status, text };
}

async function cmdVerdict(symbol, notional, expectedAction) {
  const { status, body } = await getJSON(`/api/verdict?symbol=${encodeURIComponent(symbol)}&notional=${notional}`);
  ok(`verdict ${symbol} ${notional} -> HTTP 200`, status === 200, `got ${status} ${JSON.stringify(body).slice(0, 120)}`);
  ok(`verdict ${symbol} ${notional} -> ${expectedAction}`, body?.verdict?.action === expectedAction, `got ${body?.verdict?.action}`);
  ok(`verdict ${symbol} ${notional} -> carries sha256`, typeof body?.market?.responseSha256 === "string" && body.market.responseSha256.length === 64);
}

async function cmdTicker(symbol = "BTCUSDT") {
  const { status, body } = await getJSON(`/api/ticker?symbol=${symbol}`);
  ok(`ticker ${symbol} -> ok`, body?.ok === true, JSON.stringify(body).slice(0, 120));
  ok(`ticker ${symbol} -> price is a positive number`, Number(body?.lastPrice) > 0);
}

async function cmdShare(symbol, notional) {
  const payload = Buffer.from(JSON.stringify({ s: symbol, n: notional, r: 2 })).toString("base64url");
  const { status, text } = await getHTML(`/d/${payload}`);
  ok(`share ${symbol} ${notional} -> HTTP 200`, status === 200, `got ${status}`);
  ok(`share ${symbol} ${notional} -> re-judged symbol on page`, text.includes(symbol));
}

async function cmdPages() {
  for (const p of ["/", "/desk", "/rules"]) {
    const { status, text } = await getHTML(p);
    ok(`page ${p} -> HTTP 200`, status === 200);
    ok(`page ${p} -> brand present`, text.includes("Assay"));
    ok(`page ${p} -> no raw 404 shell`, !text.includes("This page could not be found"));
  }
}

async function cmdSmoke() {
  // The demo trio, against real recorded prices.
  await cmdVerdict("DOGEUSDT", 1000, "BLOCK");
  await cmdVerdict("BTCUSDT", 50, "RESIZE");
  await cmdVerdict("BTCUSDT", 10, "PASS");
}

async function cmdEdge() {
  // Hostile and degenerate inputs must never 500.
  const cases = [
    ["/api/verdict?symbol=BTCUSDT&notional=-5", 400],
    ["/api/verdict?symbol=BTCUSDT&notional=0", 400],
    ["/api/verdict?symbol=BTCUSDT&notional=999999999999", 200],
    ["/api/verdict?symbol=%3Cscript%3E", 404],
    ["/api/verdict?symbol=BTCUSDT%F0%9F%9A%80&notional=10", 200],
    ["/api/verdict", 200],
    ["/api/verdict?symbol=PEPEUSDT&notional=20", 404],
  ];
  for (const [path, expected] of cases) {
    const { status } = await getJSON(path);
    ok(`edge ${decodeURIComponent(path).slice(0, 60)} -> ${expected}`, status === expected, `got ${status}`);
  }
  const huge = await getJSON("/api/verdict?symbol=BTCUSDT&notional=999999999999");
  ok("edge huge notional -> halts or blocks, never executes", ["HALT", "BLOCK", "RESIZE"].includes(huge.body?.verdict?.action), `got ${huge.body?.verdict?.action}`);
}

async function cmdAll() {
  await cmdPages();
  await cmdSmoke();
  await cmdTicker();
  await cmdEdge();
  await cmdShare("DOGEUSDT", 1000);
}

const commands = { verdict: cmdVerdict, ticker: cmdTicker, share: cmdShare, pages: cmdPages, smoke: cmdSmoke, edge: cmdEdge, all: cmdAll };

const [, , cmd, ...args] = process.argv;
const fn = commands[cmd];
if (!fn) {
  console.error(`usage: BASE=<url> node scripts/qa.mjs <${Object.keys(commands).join("|")}> [args]`);
  process.exit(2);
}

fn(...args)
  .then(() => {
    console.log(`\n${checks - failures}/${checks} checks passed${failures ? `, ${failures} FAILED` : " — clean"}`);
    process.exit(failures ? 1 : 0);
  })
  .catch((e) => {
    console.error("harness error:", e);
    process.exit(1);
  });
