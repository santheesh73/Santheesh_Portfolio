/**
 * Project media capture.  `pnpm media [slug ...]`
 *
 * - Live projects: screenshots (desktop 1600×1000, mobile 390×844) and an 8s
 *   scroll loop recorded with Playwright, encoded to MP4 (H.264) + WebM (VP9)
 *   ≤1.5 MB with a poster frame.
 * - Repo media: Pulse's docs/img/demo.gif → MP4 + WebM + poster.
 *
 * Live URLs come from content/projects.ts. Override per slug with
 * MEDIA_URL_<SLUG>=http://localhost:4173 (used when the live site is unreachable
 * from the build machine and a local build of the same repo is served instead).
 * Pulse needs PULSE_GIF=/path/to/demo.gif (a checkout of the Pulse repo).
 *
 * Requires ffmpeg on PATH.
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { projects } from "../content/projects";

const OUT = path.join(process.cwd(), "public", "media");
const MAX_BYTES = 1.5 * 1024 * 1024;
const only = process.argv.slice(2);

function ffmpeg(args: string[]) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
}

async function size(file: string) {
  return (await stat(file)).size;
}

/** Encode src → mp4 + webm under the size budget, plus a poster jpg. */
async function encode(src: string, dir: string, name: string, width: number) {
  const mp4 = path.join(dir, `${name}.mp4`);
  const webm = path.join(dir, `${name}.webm`);
  const vf = `scale=${width}:-2:flags=lanczos,fps=30`;
  for (const crf of [26, 30, 34, 38]) {
    ffmpeg([
      "-i",
      src,
      "-vf",
      vf,
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      String(crf),
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      mp4,
    ]);
    if ((await size(mp4)) <= MAX_BYTES) break;
  }
  for (const crf of [36, 42, 48]) {
    ffmpeg([
      "-i",
      src,
      "-vf",
      vf,
      "-an",
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "0",
      "-crf",
      String(crf),
      "-row-mt",
      "1",
      webm,
    ]);
    if ((await size(webm)) <= MAX_BYTES) break;
  }
  ffmpeg([
    "-i",
    mp4,
    "-vf",
    "select=eq(n\\,15)",
    "-frames:v",
    "1",
    "-q:v",
    "3",
    path.join(dir, `${name === "demo" ? "poster" : `${name}-poster`}.jpg`),
  ]);
  console.log(
    `  ${name}.mp4 ${((await size(mp4)) / 1024) | 0} KB · ${name}.webm ${((await size(webm)) / 1024) | 0} KB`,
  );
}

async function captureLive(slug: string, url: string) {
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium",
  });
  const shots = [
    { name: "desktop", width: 1600, height: 1000, mobile: false },
    { name: "mobile", width: 390, height: 844, mobile: true },
  ];
  for (const s of shots) {
    const tmp = path.join(dir, `.rec-${s.name}`);
    const ctx = await browser.newContext({
      viewport: { width: s.width, height: s.height },
      deviceScaleFactor: s.mobile ? 2 : 1,
      isMobile: s.mobile,
      hasTouch: s.mobile,
      recordVideo: { dir: tmp, size: { width: s.width, height: s.height } },
    });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    } catch (e) {
      await ctx.close();
      await rm(tmp, { recursive: true, force: true });
      await browser.close();
      throw e;
    }
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(dir, `${s.name}.png`) });
    // 8s loop: scroll down slowly, then back.
    const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      await page.evaluate((y) => scrollTo({ top: y }), (Math.min(h, s.height * 2) * i) / steps);
      await page.waitForTimeout(80);
    }
    for (let i = steps; i >= 0; i--) {
      await page.evaluate((y) => scrollTo({ top: y }), (Math.min(h, s.height * 2) * i) / steps);
      await page.waitForTimeout(80);
    }
    await ctx.close();
    const [raw] = await readdir(tmp);
    if (raw) await encode(path.join(tmp, raw), dir, `loop-${s.name}`, s.mobile ? 390 : 1280);
    await rm(tmp, { recursive: true, force: true });
    // PNG → keep as source for next/image (it emits AVIF/WebP at request time).
  }
  await browser.close();
}

async function main() {
  for (const p of projects) {
    if (only.length && !only.includes(p.slug)) continue;
    const override = process.env[`MEDIA_URL_${p.slug.toUpperCase().replace(/-/g, "_")}`];
    if (p.slug === "pulse") {
      const gif = process.env.PULSE_GIF;
      if (!gif) {
        console.log("pulse: set PULSE_GIF to docs/img/demo.gif from the Pulse repo; skipped");
        continue;
      }
      console.log("pulse: converting demo.gif");
      const dir = path.join(OUT, "pulse");
      await mkdir(dir, { recursive: true });
      await encode(gif, dir, "demo", 1280);
      continue;
    }
    const url = override ?? p.links.live;
    if (!url) continue;
    console.log(`${p.slug}: capturing ${url}`);
    try {
      await captureLive(p.slug, url);
    } catch (e) {
      console.log(
        `${p.slug}: capture failed (${(e as Error).message.split("\n")[0]}); keeping spec plate`,
      );
    }
  }
}

main();
