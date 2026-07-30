import { test, expect } from "@playwright/test";

/**
 * Covers the one flow that has no auth in front of it at all: the
 * public capture form. This is the flow most likely to break silently
 * since it's easy to accidentally put behind the auth middleware.
 */
test("a visitor can submit the public lead capture form", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Name").fill("Test Visitor");
  await page.getByLabel("Email").fill(`visitor-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("Thanks for reaching out.")).toBeVisible();
});

test("an unauthenticated visitor is redirected away from the dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
