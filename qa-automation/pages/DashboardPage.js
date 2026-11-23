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
    await expect(this.page.locator("h1:has-text('Plus Dashboard')")).toBeVisible();
  }

  async expectProDashboard() {
    await expect(this.page.locator("h1:has-text('Pro Dashboard')")).toBeVisible();
  }

  async expectAdminDashboard() {
    await expect(this.page.locator("h1:has-text('Admin Dashboard')")).toBeVisible();
  }
}
