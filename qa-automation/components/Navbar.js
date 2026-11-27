import { expect } from "@playwright/test";

export class Navbar {
  constructor(page) {
    this.page = page;
    this.brandTitle = page.locator("nav h1");
    this.dashboardButton = page.locator("nav button:has-text('Dashboard')");
    this.adminDashboardBtn = page.locator("nav button:has-text('Admin Dashboard')");
    this.proDashboardBtn = page.locator("nav button:has-text('Pro Dashboard')");
    this.plusDashboardBtn = page.locator("nav button:has-text('Plus Dashboard')");
    this.logoutButton = page.locator("nav button:has-text('Logout')");

    // Centered Navigation Tabs
    this.homeTab = page.locator("nav button:has-text('home')");
    this.organizationsTab = page.locator("nav button:has-text('organizations')");
    this.buildingsTab = page.locator("nav button:has-text('buildings')");
    this.usersTab = page.locator("nav button:has-text('users')");
  }

  async clickDashboard() {
    await this.dashboardButton.click();
  }

  async goToHome() {
    await this.homeTab.click();
  }

  async goToOrganizations() {
    await this.organizationsTab.click();
  }

  async goToBuildings() {
    await this.buildingsTab.click();
  }

  async goToUsers() {
    await this.usersTab.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async expectVisible() {
    await expect(this.brandTitle).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }
}
