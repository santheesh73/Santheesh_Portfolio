import { expect, test, type Page } from "@playwright/test";

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("preloader runs once per session, then the page is revealed", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  const pre = page.locator("[data-preloader]");
  await expect(pre).toBeVisible();
  await expect(pre).toHaveCount(0, { timeout: 4000 });
  expect(await page.evaluate(() => sessionStorage.getItem("ss-booted"))).toBe("1");
  await page.reload();
  await expect(pre).toBeHidden();
  expect(errors).toEqual([]);
});

test("route curtain covers, navigates, lifts; back restores scroll", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop flow");
  const errors = collectErrors(page);
  await page.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
  await page.goto("/");
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(1500);
  const y = await page.evaluate(() => Math.round(scrollY));
  expect(y).toBeGreaterThan(100);

  const t0 = Date.now();
  // Record the curtain's highest point in-page, frame by frame.
  await page.evaluate(() => {
    const w = window as unknown as { __minTop: number };
    w.__minTop = Infinity;
    const panel = document.querySelector("[data-panel]")!;
    const end = performance.now() + 1500;
    const tick = () => {
      w.__minTop = Math.min(w.__minTop, panel.getBoundingClientRect().top);
      if (performance.now() < end) requestAnimationFrame(tick);
    };
    tick();
    document.querySelector<HTMLAnchorElement>("main a[href='/work']")!.click();
  });
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator("h1")).toHaveText("Work.");
  await expect(page.locator("[data-panel]").first()).toBeHidden({ timeout: 2000 });
  expect(
    await page.evaluate(
      () => document.querySelector("[data-panel]")!.getBoundingClientRect().bottom,
    ),
  ).toBeLessThan(5);
  expect(Date.now() - t0).toBeLessThan(1600);
  expect(
    await page.evaluate(() => (window as unknown as { __minTop: number }).__minTop),
  ).toBeLessThan(2);
  expect(await page.evaluate(() => scrollY)).toBe(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBeGreaterThan(y - 5);
  expect(errors).toEqual([]);
});

test("menu opens, traps focus, closes on Escape", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /menu/i });
  await toggle.click();
  const dialog = page.getByRole("dialog", { name: "Site menu" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Work" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("G toggles the blueprint grid", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
  await page.goto("/", { waitUntil: "networkidle" }); // key listener attaches on hydration
  const grid = page.locator("[data-blueprint]");
  await expect(grid).toHaveAttribute("data-blueprint", "off");
  await page.keyboard.press("g");
  await expect(grid).toHaveAttribute("data-blueprint", "on");
});

test("theme toggle switches to dark, remembers it, and dark mode has no axe contrast issues", async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
  await page.goto("/about");
  await page.waitForLoadState("networkidle");
  const html = page.locator("html");
  await page.getByRole("button", { name: /switch to dark theme/i }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(12, 14, 20)");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.waitForTimeout(1500);
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const axe = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .exclude("canvas")
    .analyze();
  expect(axe.violations.map((v) => v.nodes.map((n) => n.target.join(" ")))).toEqual([]);
  await page.getByRole("button", { name: /switch to light theme/i }).click();
  await expect(html).toHaveAttribute("data-theme", "light");
});

test("header turns solid once scrolled, and desktop shows page links", async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
  await page.goto("/about", { waitUntil: "networkidle" });
  const header = page.locator("header").first();
  await expect(header).toHaveClass(/bg-transparent/);
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(header).toHaveClass(/bg-paper/);
  const nav = page.getByRole("navigation", { name: "Primary" });
  if (isMobile) await expect(nav).toBeHidden();
  else
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
});
