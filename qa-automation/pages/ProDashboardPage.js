import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class ProDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.locator("h1:has-text('Pro Dashboard')");
    this.viewProjectsCard = page.locator("h3:has-text('View Projects')");
    this.createProjectCard = page.locator("h3:has-text('Create Project')");
    this.advancedAnalyticsCard = page.locator("h3:has-text('Advanced Analytics')");
    this.exportReportsCard = page.locator("h3:has-text('Export Reports')");
    this.prioritySupportCard = page.locator("h3:has-text('Priority Support')");
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.viewProjectsCard).toBeVisible();
    await expect(this.createProjectCard).toBeVisible();
    await expect(this.advancedAnalyticsCard).toBeVisible();
    await expect(this.exportReportsCard).toBeVisible();
    await expect(this.prioritySupportCard).toBeVisible();
  }
}
