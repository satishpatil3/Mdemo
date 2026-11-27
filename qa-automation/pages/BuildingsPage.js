import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class BuildingsPage extends BasePage {
  constructor(page) {
    super(page);
    this.orgFilterSelect = page.locator("select");
    this.buildingCards = page.locator("div[role='button']:has(h4)");

    // Edit Building view
    this.backButton = page.locator("button:has-text('Back to Buildings')");
    this.buildingNameInput = page.locator("form input[placeholder*='Building Name' i]");
    this.addFloorButton = page.locator("button:has-text('add floor')");
    this.saveChangesButton = page.locator("button:has-text('Save Changes')");
    this.deleteBuildingButton = page.locator("button:has-text('Delete Building')");
    this.floorNameInputs = page.locator("input[placeholder*='floor' i]");
  }

  getBuildingCard(name) {
    return this.page.locator(`div[role='button']:has(h4:has-text('${name}'))`);
  }

  async filterByOrganization(orgName) {
    await this.orgFilterSelect.selectOption(orgName);
  }

  async openBuilding(name) {
    const card = this.getBuildingCard(name);
    await card.waitFor({ state: "visible", timeout: 15000 });
    await card.click();
  }

  async clickEditBuilding(index = 0) {
    const card = this.buildingCards.nth(index);
    await card.waitFor({ state: "visible", timeout: 15000 });
    await card.click();
  }

  async backToBuildings() {
    await this.backButton.click();
  }

  async addNewFloor(floorName) {
    await this.addFloorButton.click();
    const lastInput = this.floorNameInputs.last();
    await lastInput.fill(floorName);
  }
}
