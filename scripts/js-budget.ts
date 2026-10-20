/**
 * Initial JS per route (gzip), as the browser loads it: `pnpm budget` (server on 3100).
 * Counts every <script src> in the server HTML except the nomodule polyfill.
 * Lazy chunks (the WebGL field) are not in the HTML, so they are excluded by construction.
 */
import { gzipSync } from "node:zlib";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/work", "/work/pulse", "/about", "/lab"];
const BUDGET = 180 * 1024;

async function main() {
  let failed = false;
  for (const r of ROUTES) {
    const html = await (await fetch(BASE + r)).text();
    const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"[^>]*>/g)]
      .filter((m) => !/nomodule/i.test(m[0]))
      .map((m) => m[1]!);
    let total = 0;
    const rows: [string, number][] = [];
    for (const s of new Set(srcs)) {
      const buf = Buffer.from(await (await fetch(new URL(s, BASE))).arrayBuffer());
      const gz = gzipSync(buf, { level: 9 }).length;
      total += gz;
      rows.push([s.split("/").pop()!, gz]);
    }
    rows.sort((a, b) => b[1] - a[1]);
    const kb = (n: number) => (n / 1024).toFixed(1) + " KB";
    console.log(`${r}  ${kb(total)} gzip${total > BUDGET ? "  OVER BUDGET" : ""}`);
    rows.slice(0, Number(process.env.TOP ?? 6)).forEach(([n, s]) => console.log(`   ${kb(s).padStart(9)}  ${n}`));
    if (total > BUDGET) failed = true;
  }
  if (failed) process.exitCode = 1;
}

main();
