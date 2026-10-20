import { chromium } from "@playwright/test";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { SourceMapConsumer } = require("./node_modules/.pnpm/source-map@0.7.6/node_modules/source-map");
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 412, height: 823 } });
const c = await p.context().newCDPSession(p);
await c.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await c.send("Profiler.enable"); await c.send("Profiler.setSamplingInterval", { interval: 200 });
await c.send("Profiler.start");
await p.goto("http://localhost:3100" + (process.argv[2] || "/"));
await p.waitForTimeout(5000);
const { profile } = await c.send("Profiler.stop");
await b.close();
const dt = {}; profile.nodes.forEach(n => dt[n.id] = 0);
for (let i = 0; i < profile.samples.length; i++) dt[profile.samples[i]] += profile.timeDeltas[i] || 0;
const byId = Object.fromEntries(profile.nodes.map(n => [n.id, n]));
const parent = {}; profile.nodes.forEach(n => (n.children || []).forEach(ch => parent[ch] = n.id));
const maps = {};
async function resolve(cf) {
  const m = cf.url.match(/_next\/static\/(.*\.js)/); if (!m) return cf.functionName + "@" + (cf.url.split("/").pop() || "native");
  const f = ".next/static/" + m[1] + ".map";
  if (!fs.existsSync(f)) return cf.functionName + "@" + m[1];
  maps[f] ??= await new SourceMapConsumer(JSON.parse(fs.readFileSync(f)));
  const o = maps[f].originalPositionFor({ line: cf.lineNumber + 1, column: cf.columnNumber });
  return (o.name || cf.functionName) + " " + (o.source || "").replace(/.*node_modules\/(\.pnpm\/)?/, "").replace(/webpack:\/\/_N_E\//, "").slice(-60) + ":" + o.line;
}
// inclusive time per app source frame (first-party components)
const incl = {}; const self = {};
for (const n of profile.nodes) {
  const t = dt[n.id]; if (!t) continue;
  const key = await resolve(n.callFrame); self[key] = (self[key] || 0) + t;
  const seen = new Set(); let id = n.id;
  while (id != null) { const k = await resolve(byId[id].callFrame); if (!seen.has(k) && /(components|lib|app)\//.test(k) && !/node_modules/.test(k)) { incl[k] = (incl[k] || 0) + t; seen.add(k); } id = parent[id]; }
}
const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => (v / 1000).toFixed(0).padStart(5) + "ms " + k).join("\n");
console.log("== self\n" + top(self, 18)); console.log("== inclusive first-party\n" + top(incl, 25));
