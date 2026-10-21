/**
 * Review screenshots: `pnpm shots <phase> [route ...]`
 * Expects a server on BASE_URL (default http://localhost:3100, run `pnpm start -p 3100`).
 * Scrolls each page through once so scroll-triggered reveals fire, then captures
 * full-page desktop (1440×900) and mobile (390×844) PNGs into .review/<phase>/.
 */
import { chromium, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const [phase = "adhoc", ...routesArg] = process.argv.slice(2);
const routes = routesArg.length ? routesArg : ["/"];
const out = path.join(process.cwd(), ".review", phase);

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
] as const;

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 400;
  for (let y = 0; y < height; y += step) {
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
}

async function main() {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium",
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const errors: string[] = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      // COLOR_SCHEME=dark pnpm shots p8/dark / … captures the dark theme
      colorScheme: process.env.COLOR_SCHEME === "dark" ? "dark" : "light",
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    for (const route of routes) {
      const page = await ctx.newPage();
      page.on(
        "console",
        (m) => m.type() === "error" && errors.push(`[${vp.name} ${route}] ${m.text()}`),
      );
      page.on(
        "response",
        (r) => r.status() >= 400 && errors.push(`[${vp.name} ${route}] ${r.status()} ${r.url()}`),
      );
      page.on("pageerror", (e) => errors.push(`[${vp.name} ${route}] ${e.message}`));
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(out, `${slug(route)}-${vp.name}-fold.png`) });
      await scrollThrough(page);
      await page.screenshot({
        path: path.join(out, `${slug(route)}-${vp.name}.png`),
        fullPage: true,
      });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  if (errors.length) {
    console.log("Console errors:\n" + errors.join("\n"));
    process.exitCode = 1;
  } else console.log(`OK — ${routes.length} route(s) → ${out}`);
}

const slug = (r: string) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/\//g, "_"));

main();
