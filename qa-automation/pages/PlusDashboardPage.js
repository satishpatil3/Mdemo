import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class PlusDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.locator("h1:has-text('Plus Dashboard')");
    this.viewProjectsCard = page.locator("h3:has-text('View Projects')");
    this.createProjectCard = page.locator("h3:has-text('Create Project')");
    this.basicReportsCard = page.locator("h3:has-text('Basic Reports')");
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.viewProjectsCard).toBeVisible();
    await expect(this.createProjectCard).toBeVisible();
    await expect(this.basicReportsCard).toBeVisible();
  }
}
