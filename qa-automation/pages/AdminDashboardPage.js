import { BasePage } from "./BasePage.js";
import { AddUserModal } from "../components/AddUserModal.js";
import { ManageUsersTable } from "../components/ManageUsersTable.js";
import { RoleManagementSection } from "../components/RoleManagementSection.js";
import { expect } from "@playwright/test";

export class AdminDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.locator("h1:has-text('Admin Dashboard')");

    // Feature Cards
    this.addUserCard = page.locator("h3:has-text('Add User')");
    this.manageUsersCard = page.locator("h3:has-text('Manage Users')");
    this.roleManagementCard = page.locator("h3:has-text('Role Management')");
    this.analyticsCard = page.locator("h3:has-text('Analytics')");
    this.reportsCard = page.locator("h3:has-text('Reports')");
    this.settingsCard = page.locator("h3:has-text('Settings')");

    // Sub-components
    this.addUserModal = new AddUserModal(page);
    this.manageUsersTable = new ManageUsersTable(page);
    this.roleManagementSection = new RoleManagementSection(page);
  }

  async openAddUser() {
    await this.addUserCard.click();
    await this.addUserModal.expectVisible();
  }

  async openManageUsers() {
    await this.manageUsersCard.click();
    await expect(this.manageUsersTable.tableTitle).toBeVisible();
  }

  async openRoleManagement() {
    await this.roleManagementCard.click();
    await expect(this.roleManagementSection.sectionTitle).toBeVisible();
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.addUserCard).toBeVisible();
    await expect(this.manageUsersCard).toBeVisible();
    await expect(this.roleManagementCard).toBeVisible();
  }
}
