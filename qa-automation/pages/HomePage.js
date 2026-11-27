import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.totalOrgsCard = page.locator("h4:has-text('Total Organizations')");
    this.totalBuildingsCard = page.locator("h4:has-text('Total Buildings')");
    this.totalUsersCard = page.locator("h4:has-text('Total Users')");

    // Clickable card containers using specific role='button'
    this.totalOrgsContainer = page.locator("div[role='button']:has(h4:has-text('Total Organizations'))");
    this.totalBuildingsContainer = page.locator("div[role='button']:has(h4:has-text('Total Buildings'))");
    this.totalUsersContainer = page.locator("div[role='button']:has(h4:has-text('Total Users'))");
  }

  async verifyDashboardBadge(tier) {
    await expect(this.page.locator(`nav button:has-text('${tier} Dashboard')`)).toBeVisible();
  }

  async clickTotalOrgs() {
    await this.totalOrgsContainer.click();
  }

  async clickTotalBuildings() {
    await this.totalBuildingsContainer.click();
  }

  async clickTotalUsers() {
    await this.totalUsersContainer.click();
  }

  async expectOverviewLoaded() {
    await expect(this.totalOrgsCard).toBeVisible();
    await expect(this.totalBuildingsCard).toBeVisible();
    await expect(this.totalUsersCard).toBeVisible();
  }
}
