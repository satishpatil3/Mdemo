import { expect } from "@playwright/test";

/**
 * Common reusable assertions
 */
export async function assertToastContains(page, text) {
  const toastLocator = page.locator(`div:has-text("${text}")`).first();
  await expect(toastLocator).toBeVisible({ timeout: 6000 });
}

export async function assertRedirectTo(page, pattern) {
  await expect(page).toHaveURL(new RegExp(pattern));
}
