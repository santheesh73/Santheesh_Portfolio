import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
});

test("hero headline is real text and the field compiles to structure on scroll", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I engineer the rest.");
  await expect(page.locator("section[aria-labelledby='hero-title'] canvas")).toHaveCount(1);
  const caption = page.locator("section[aria-labelledby='hero-title'] .text-signal.tabular-nums");
  await expect(caption).toHaveText("0.84");
  const vh = page.viewportSize()!.height;
  await page.evaluate((h) => window.scrollTo(0, h * 1.05), vh);
  await expect(caption).toHaveText("0.00", { timeout: 4000 });
  expect(errors).toEqual([]);
});

test("reduced motion shows the structured field immediately", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toBeHidden();
  const caption = page.locator("section[aria-labelledby='hero-title'] .text-signal.tabular-nums");
  await expect(caption).toHaveText("0.00");
  await expect(page.locator("section[aria-labelledby='hero-title'] canvas")).toHaveCount(1);
  await ctx.close();
});
