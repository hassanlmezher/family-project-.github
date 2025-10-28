// frontend/tests/ui.spec.ts
import { test, expect } from "@playwright/test";

test("CRUD flow", async ({ page }) => {
  await page.goto("http://localhost:5173");

  const email = `test${Date.now()}@example.com`;

  // SIGN UP
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.fill('input[placeholder="Enter your full name"]', "Test User");
  await page.fill('input[placeholder="Enter your email"]', email);
  await page.fill('input[placeholder="Create a password"]', "password123");
  await page.getByTestId("signup-submit").click();

  // CREATE FAMILY
  await page.locator('input').nth(1).fill("Test Family");
  await page.getByRole("button", { name: "Create Family" }).click();

  // CREATE — add an item
  await page.getByPlaceholder("Item name").waitFor({ state: "visible" });
  await page.fill('input[placeholder="Item name"]', "Milk");
  await page.fill('input[placeholder="Quantity"]', "2");
  await page.getByRole("button", { name: "Add Item" }).click();

  // Verify item appears in list
  await expect(page.getByText("Milk")).toBeVisible();
});
