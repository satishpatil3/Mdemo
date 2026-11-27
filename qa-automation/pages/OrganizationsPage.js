import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class OrganizationsPage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = page.locator("input[placeholder='search']");
    this.addOrgButton = page.locator("button:has-text('add organization')");
    this.orgCards = page.locator("div[role='button']:has(h3)");

    // Add Organization Modal
    this.modalNameInput = page.locator(".fixed input[placeholder*='Organization Name' i], .fixed form input[type='text']");
    this.modalCreateButton = page.locator(".fixed button[type='submit'], .fixed button:has-text('Create')");
    this.modalCancelButton = page.locator(".fixed button:has-text('Cancel')");

    // Edit Organization Screen
    this.backButton = page.locator("button:has-text('Back to Organizations')");
    this.editNameInput = page.locator("form input[placeholder*='Organization Name' i]");
    this.editSpecializationInput = page.locator("input[list='specialization-suggestions']");
    this.editStreetAddressInput = page.locator("input[placeholder*='Street Address' i]");
    this.editCityInput = page.locator("input[placeholder*='City' i]");
    this.saveChangesButton = page.locator("button:has-text('Save Changes')");
    this.deleteOrgButton = page.locator("button:has-text('Delete Organization')");
    this.addBuildingInOrgButton = page.locator("button:has-text('Add Building')");

    // Modal for adding building inside Edit Org
    this.addBuildingModal = page.locator(".fixed:has-text('Add Building')");
    this.buildingModalNameInput = page.locator(".fixed input[placeholder*='Building Name' i], .fixed form input[type='text']");
    this.buildingModalCreateBtn = page.locator(".fixed button[type='submit'], .fixed button:has-text('Create')");
  }

  getCardByName(name) {
    return this.page.locator(`div[role='button']:has(h3:has-text('${name}'))`);
  }

  async search(query) {
    await this.searchInput.fill(query);
  }

  async clickAddOrganization() {
    await this.addOrgButton.click();
  }

  async createOrganization(name) {
    await this.clickAddOrganization();
    const input = this.modalNameInput.first();
    await input.waitFor({ state: "visible", timeout: 10000 });
    await input.fill(name);
    await this.modalCreateButton.first().click();
  }

  async openOrganization(name) {
    const card = this.getCardByName(name);
    await card.waitFor({ state: "visible", timeout: 15000 });
    await card.click();
  }

  async clickEditOrg(index = 0) {
    const card = this.orgCards.nth(index);
    await card.waitFor({ state: "visible", timeout: 15000 });
    await card.click();
  }

  async backToCards() {
    await this.backButton.click();
  }

  async addBuildingFromOrg(buildingName) {
    await this.addBuildingInOrgButton.click();
    const nameInput = this.buildingModalNameInput.first();
    await nameInput.waitFor({ state: "visible", timeout: 10000 });
    await nameInput.fill(buildingName);
    await this.buildingModalCreateBtn.first().click();
  }
}
