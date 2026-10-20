import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
});

test("/work filters and switches list ↔ grid", async ({ page }) => {
  await page.goto("/work");
  const items = page.locator("li[data-item]:visible");
  await expect(items).toHaveCount(9);
  await page.getByRole("button", { name: /^Developer tools/ }).click();
  await expect(items).toHaveCount(2);
  await page.getByRole("button", { name: /^All/ }).click();
  await page.getByRole("button", { name: "Grid" }).click();
  await expect(page.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-item-media]:visible")).toHaveCount(9);
  await page.waitForTimeout(1000);
  await expect(items.first()).toHaveCSS("opacity", "1");
});

test("case study shows meta, section rail and loops to the next project", async ({ page }, info) => {
  await page.goto("/work/orion");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Orion");
  await expect(page.getByText("Private AI. Zero cloud.", { exact: false }).first()).toBeVisible();
  if (info.project.name === "desktop") {
    await expect(page.getByRole("navigation", { name: "Case study sections" })).toBeVisible();
  }
  const next = page.getByRole("region", { name: "Next project" });
  await expect(next.getByRole("link")).toHaveAttribute("href", "/work/frontend-craft");
  // scrolling through the next-project section fires the transition
  await next.scrollIntoViewIfNeeded();
  for (let i = 0; i < 40 && !page.url().endsWith("/work/frontend-craft"); i++) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(80);
  }
  await expect(page).toHaveURL(/\/work\/frontend-craft$/, { timeout: 5000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Frontend Craft");
});

test("about and lab render real content", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "Three rules." })).toBeVisible();
  await expect(page.getByText("The model reads. Code decides.")).toBeVisible();
  await page.goto("/lab");
  const slop = page.locator("h2", { hasText: "Slop Lint." });
  // tiles stay hidden until they scroll into view (they snap onto the grid)
  await slop.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(slop).toBeVisible();
  await expect(page.getByText("a11y/contrast")).toBeAttached();
});

test("404 compiles into → HOME and the link goes home", async ({ page }) => {
  const res = await page.goto("/nope");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("isn't part of the system");
  await page.mouse.click(400, 300);
  await expect(page.getByText("Click the field to go home.")).toBeVisible();
  await page.getByRole("link", { name: "Back to the index →" }).click();
  await expect(page).toHaveURL(/\/$/);
});
