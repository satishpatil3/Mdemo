import { expect } from "@playwright/test";

export class RoleManagementSection {
  constructor(page) {
    this.page = page;
    this.sectionTitle = page.locator("h2:has-text('Role Management')");
    this.emailInput = page.locator("input[placeholder='Enter signed-up user email...']");
    this.plusRadio = page.locator("form input[value='plus']");
    this.proRadio = page.locator("form input[value='pro']");
    this.adminRadio = page.locator("form input[value='admin']");
    this.changeRoleButton = page.locator("button:has-text('Change Role')");
    this.closeButton = page.locator("div:has(> div h2:has-text('Role Management')) button.text-xl:has-text('✕')");
  }

  getRowByEmail(email) {
    return this.page.locator("table tbody tr", { hasText: email });
  }

  async selectUserToEdit(email) {
    const row = this.getRowByEmail(email);
    const button = row.locator("button:has-text('Select to Edit Role')");
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click();
  }

  async isPendingLocked(email) {
    const row = this.getRowByEmail(email);
    const badge = row.locator("text=🔒 Cannot Edit (Signup Pending)");
    await badge.waitFor({ state: "visible", timeout: 10000 });
    return await badge.isVisible();
  }

  async isSelfProtected(email) {
    const row = this.getRowByEmail(email);
    const badge = row.locator("text=You (Self)");
    await badge.waitFor({ state: "visible", timeout: 10000 });
    return await badge.isVisible();
  }

  async changeRole(email, newRole) {
    await this.emailInput.fill(email);
    if (newRole === "admin") {
      await this.adminRadio.check();
    } else if (newRole === "pro") {
      await this.proRadio.check();
    } else {
      await this.plusRadio.check();
    }
    await this.changeRoleButton.click();
  }

  async close() {
    await this.closeButton.click();
  }
}
