import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
});

test("home renders every section in order, ending in the contact footer", async ({ page }) => {
  await page.goto("/");
  const headings = await page.locator("main h2, footer h2").allTextContents();
  expect(headings.join(" | ")).toMatch(/Work\..*Tools, by layer\..*Public record\..*Let's build something useful\./);
  await expect(page.locator("footer#contact")).toBeAttached();
});

test("copy email shows a Copied state", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const btn = page.locator("footer#contact button").first();
  await expect(btn).toHaveText("Copy email");
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(btn).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("santheesh737@gmail.com");
});

test("a work plate flips into its case study", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "the reel is a plain stack on mobile; same link");
  await page.goto("/");
  const plate = page.locator('a[data-flip-id="orion"]');
  await plate.scrollIntoViewIfNeeded();
  await plate.click();
  await expect(page).toHaveURL(/\/work\/orion$/);
  await expect(page.locator('[data-flip-target="orion"]')).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Orion");
});

test("keyboard focus brings an off-screen reel plate into view", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "pinned reel is desktop only");
  await page.goto("/", { waitUntil: "networkidle" });
  const last = page.locator('a[data-flip-id="prysm"]');
  await last.focus();
  await expect
    .poll(async () => {
      const b = await last.boundingBox();
      return b ? b.x >= -1 && b.x + b.width / 2 < 1440 && b.y < 900 && b.y + b.height > 0 : false;
    })
    .toBe(true);
});

test("reduced motion lays the horizontal scenes out in full", async ({ browser }, info) => {
  test.skip(info.project.name === "mobile", "desktop layout");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  for (const name of ["Read.", "Validate.", "Decide.", "Explain."]) {
    await expect(page.locator("ol h3, ol li").filter({ hasText: name }).first()).toBeVisible();
  }
  const right = await page.locator('a[data-flip-id="prysm"]').evaluate((e) => e.getBoundingClientRect().right);
  expect(right).toBeLessThanOrEqual(1440);
  await ctx.close();
});
