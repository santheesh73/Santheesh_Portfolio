import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { projects } from "../content/projects";

const ROUTES = [
  "/",
  "/work",
  ...projects.map((p) => `/work/${p.slug}`),
  "/about",
  "/lab",
  "/styleguide",
  "/missing-page",
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("ss-booted", "1"));
});

for (const route of ROUTES) {
  test(`${route} loads with no console errors and no axe violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      // the 404 route's document request is a 404 by design
      if (m.type() === "error" && !(route === "/missing-page" && /404/.test(m.text())))
        errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(route);
    expect(res?.status()).toBe(route === "/missing-page" ? 404 : 200);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1").first()).toBeVisible();

    // walk the page so scroll-triggered pieces mount too
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.8) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);

    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // decorative WebGL/canvas layers are aria-hidden; colour contrast on text mid-animation is checked by Lighthouse
      .exclude("canvas")
      .analyze();
    const violations = axe.violations.map(
      (v) =>
        `${v.id}: ${v.nodes
          .map((n) => n.target.join(" "))
          .slice(0, 3)
          .join(" | ")}`,
    );
    expect(violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}
