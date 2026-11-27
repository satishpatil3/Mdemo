import { BasePage } from "./BasePage.js";
import { AddUserModal } from "../components/AddUserModal.js";
import { ManageUsersTable } from "../components/ManageUsersTable.js";
import { RoleManagementSection } from "../components/RoleManagementSection.js";
import { expect } from "@playwright/test";

export class AdminDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.locator("nav:has-text('Admin Dashboard')");

    // Sub-navbar Tabs
    this.homeTab = page.locator("nav button:has-text('home')");
    this.organizationsTab = page.locator("nav button:has-text('organizations')");
    this.buildingsTab = page.locator("nav button:has-text('buildings')");
    this.usersTab = page.locator("nav button:has-text('users')");

    // Home Overview Cards
    this.totalOrgsCard = page.locator("h4:has-text('Total Organizations')");
    this.totalBuildingsCard = page.locator("h4:has-text('Total Buildings')");
    this.totalUsersCard = page.locator("h4:has-text('Total Users')");

    // Feature Cards (in users tab)
    this.addUserCard = page.locator("h3:has-text('Add User')");
    this.manageUsersCard = page.locator("h3:has-text('Manage Users')");
    this.roleManagementCard = page.locator("h3:has-text('Role Management')");

    // Sub-components
    this.addUserModal = new AddUserModal(page);
    this.manageUsersTable = new ManageUsersTable(page);
    this.roleManagementSection = new RoleManagementSection(page);
  }

  async goToHomeTab() {
    await this.homeTab.click();
  }

  async goToUsersTab() {
    await this.usersTab.click();
  }

  async goToOrganizationsTab() {
    await this.organizationsTab.click();
  }

  async goToBuildingsTab() {
    await this.buildingsTab.click();
  }

  async openAddUser() {
    await this.goToUsersTab();
    await this.addUserCard.click();
    await this.addUserModal.expectVisible();
  }

  async openManageUsers() {
    await this.goToUsersTab();
    await this.manageUsersCard.click();
    await expect(this.manageUsersTable.tableTitle).toBeVisible();
  }

  async openRoleManagement() {
    await this.goToUsersTab();
    await this.roleManagementCard.click();
    await expect(this.roleManagementSection.sectionTitle).toBeVisible();
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.totalOrgsCard).toBeVisible();
    await expect(this.totalBuildingsCard).toBeVisible();
    await expect(this.totalUsersCard).toBeVisible();
  }
}
