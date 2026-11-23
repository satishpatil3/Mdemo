import { expect } from "@playwright/test";

export class Navbar {
  constructor(page) {
    this.page = page;
    this.brandTitle = page.locator("nav h1");
    this.dashboardLink = page.locator("nav a:has-text('Dashboard')");
    this.logoutButton = page.locator("nav button:has-text('Logout')");
  }

  async clickDashboard() {
    await this.dashboardLink.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async expectVisible() {
    await expect(this.brandTitle).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }
}
