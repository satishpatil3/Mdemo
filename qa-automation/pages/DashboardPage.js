import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await super.goto("/dashboard");
  }

  async expectPlusDashboard() {
    await expect(this.page.locator("nav:has-text('Plus Dashboard')")).toBeVisible();
    await expect(this.page.locator("text=Total Organizations")).toBeVisible();
  }

  async expectProDashboard() {
    await expect(this.page.locator("nav:has-text('Pro Dashboard')")).toBeVisible();
    await expect(this.page.locator("text=Total Organizations")).toBeVisible();
  }

  async expectAdminDashboard() {
    await expect(this.page.locator("nav:has-text('Admin Dashboard')")).toBeVisible();
    await expect(this.page.locator("text=Total Organizations")).toBeVisible();
  }
}
