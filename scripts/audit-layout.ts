/**
 * Layout audit: `pnpm audit:layout` (server on 3100).
 * 1. No horizontal page scroll at 360 / 390 / 768 / 1024 / 1440 / 1920.
 * 2. With prefers-reduced-motion, no text in <main> or the footer is left hidden.
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const ROUTES = ["/", "/work", "/work/pulse", "/work/minchal", "/work/prysm", "/about", "/lab", "/nope"];
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium" });
  const problems: string[] = [];
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 768, hasTouch: w < 768 });
    await ctx.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
    const page = await ctx.newPage();
    for (const r of ROUTES) {
      await page.goto(BASE + r, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const over = await page.evaluate(() => {
        const doc = document.documentElement;
        if (doc.scrollWidth <= doc.clientWidth + 1) return null;
        const wide = [...document.querySelectorAll("body *")]
          .filter((e) => {
            const b = e.getBoundingClientRect();
            return b.right > doc.clientWidth + 1 && getComputedStyle(e).position !== "fixed";
          })
          .slice(0, 3)
          .map((e) => `${e.tagName}.${String((e as HTMLElement).className).slice(0, 60)}`);
        return `${doc.scrollWidth}px > ${doc.clientWidth}px: ${wide.join(" | ")}`;
      });
      if (over) problems.push(`[overflow ${w}] ${r}: ${over}`);
    }
    await ctx.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const hidden = await page.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll("main *, footer *").forEach((e) => {
        const el = e as HTMLElement;
        if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) return;
        if (el.closest("[aria-hidden='true'], .sr-only, [hidden]")) return;
        let n: HTMLElement | null = el;
        while (n) {
          const cs = getComputedStyle(n);
          if (cs.visibility === "hidden" || Number(cs.opacity) < 0.05 || cs.display === "none") {
            out.push(`${el.tagName} "${el.textContent!.trim().slice(0, 40)}" (${n.tagName} ${cs.display === "none" ? "display:none" : cs.visibility === "hidden" ? "hidden" : "opacity " + cs.opacity})`);
            break;
          }
          n = n.parentElement;
        }
      });
      return out;
    });
    // display:none is legitimate for responsive variants; report only invisible-but-laid-out text
    hidden.filter((h) => !h.includes("display:none")).slice(0, 5).forEach((h) => problems.push(`[reduced] ${r}: ${h}`));
  }
  await browser.close();
  console.log(problems.length ? problems.join("\n") : "layout audit: clean");
  if (problems.length) process.exitCode = 1;
}

main();
