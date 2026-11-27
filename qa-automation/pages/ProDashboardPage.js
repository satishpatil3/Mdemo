import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class ProDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.locator("nav:has-text('Pro Dashboard')");
    this.totalOrgsCard = page.locator("h4:has-text('Total Organizations')");
    this.totalBuildingsCard = page.locator("h4:has-text('Total Buildings')");
    this.totalUsersCard = page.locator("h4:has-text('Total Users')");
    this.usersTab = page.locator("nav button:has-text('users')");
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.totalOrgsCard).toBeVisible();
    await expect(this.totalBuildingsCard).toBeVisible();
    await expect(this.totalUsersCard).toBeVisible();
    // Users tab must be hidden for Pro
    await expect(this.usersTab).toHaveCount(0);
  }
}
