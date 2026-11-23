import { expect } from "@playwright/test";

export class Toast {
  constructor(page) {
    this.page = page;
    this.container = page.locator(".fixed.top-5.right-5");
  }

  async expectMessage(text, timeout = 6000) {
    const toastItem = this.page.locator(`text=${text}`).first();
    await expect(toastItem).toBeVisible({ timeout });
  }

  async expectSuccess(text, timeout = 6000) {
    await this.expectMessage(text, timeout);
  }

  async expectError(text, timeout = 6000) {
    await this.expectMessage(text, timeout);
  }

  async expectWarning(text, timeout = 6000) {
    await this.expectMessage(text, timeout);
  }

  async closeActiveToast() {
    const closeBtn = this.container.locator("button:has-text('✕')").first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }
}
