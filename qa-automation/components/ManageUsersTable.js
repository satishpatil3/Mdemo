import { expect } from "@playwright/test";

export class ManageUsersTable {
  constructor(page) {
    this.page = page;
    this.tableTitle = page.locator("h2:has-text('Manage Users')");
    this.closeButton = page.locator("div:has(> div h2:has-text('Manage Users')) button.text-xl:has-text('✕')");
    this.tableRows = page.locator("table tbody tr");
  }

  getRowByEmail(email) {
    return this.page.locator("table tbody tr", { hasText: email });
  }

  async expectUserPresent(email) {
    await expect(this.getRowByEmail(email)).toBeVisible();
  }

  async expectUserNotPresent(email) {
    await expect(this.getRowByEmail(email)).not.toBeVisible();
  }

  async expectStatus(email, expectedStatus) {
    const row = this.getRowByEmail(email);
    await expect(row.locator(`text=${expectedStatus}`)).toBeVisible();
  }

  async expectRole(email, expectedRole) {
    const row = this.getRowByEmail(email);
    await expect(row.locator(`span:has-text('${expectedRole}')`)).toBeVisible();
  }

  async isSelfProtected(email) {
    const row = this.getRowByEmail(email);
    return await row.locator("text=You (Active Admin)").isVisible();
  }

  async deleteUser(email) {
    const row = this.getRowByEmail(email);
    // Auto-accept confirmation dialog
    this.page.once("dialog", (dialog) => dialog.accept());
    await row.locator("button:has-text('Delete')").click();
  }

  async close() {
    await this.closeButton.click();
  }
}
