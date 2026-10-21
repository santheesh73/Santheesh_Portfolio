/**
 * Viewport frames through a scrolled page: `pnpm frames <phase> <route> [count]`.
 * Pinned sections don't read in a full-page capture, so this steps the scroll
 * position and grabs the viewport at each stop (desktop + mobile).
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const [phase = "adhoc", route = "/", countArg = "24"] = process.argv.slice(2);
const count = Number(countArg);
const out = path.join(process.cwd(), ".review", phase, "frames");
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
] as const;

async function main() {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium",
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      colorScheme: process.env.COLOR_SCHEME === "dark" ? "dark" : "light",
    });
    await ctx.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let i = 0; i <= count; i++) {
      const y = Math.round((h * i) / count);
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(700);
      const name = `${route === "/" ? "home" : route.slice(1).replace(/\//g, "_")}-${vp.name}-${String(i).padStart(2, "0")}.png`;
      await page.screenshot({ path: path.join(out, name) });
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`frames → ${out}`);
}

main();
