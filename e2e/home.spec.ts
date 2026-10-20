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
