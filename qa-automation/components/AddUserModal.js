import { expect } from "@playwright/test";

export class AddUserModal {
  constructor(page) {
    this.page = page;
    this.modalTitle = page.locator("h2:has-text('Add User')");
    this.nameInput = page.locator("input[placeholder='Display Name']");
    this.emailInput = page.locator("input[placeholder='User Email']");
    this.plusRadio = page.locator("input[type='radio'][value='plus']");
    this.proRadio = page.locator("input[type='radio'][value='pro']");
    this.adminRadio = page.locator("input[type='radio'][value='admin']");
    this.createButton = page.locator("button:has-text('Create')");
    this.cancelButton = page.locator("button:has-text('Cancel')");
    this.closeButton = page.locator("div.fixed button.text-xl:has-text('✕')");
  }

  async fillForm({ name, email, role = "plus" }) {
    if (name) await this.nameInput.fill(name);
    if (email) await this.emailInput.fill(email);

    if (role === "admin") {
      await this.adminRadio.check();
    } else if (role === "pro") {
      await this.proRadio.check();
    } else {
      await this.plusRadio.check();
    }
  }

  async submit() {
    await this.createButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async close() {
    await this.closeButton.click();
  }

  async expectVisible() {
    await expect(this.modalTitle).toBeVisible();
  }

  async expectHidden() {
    await expect(this.modalTitle).not.toBeVisible();
  }
}
