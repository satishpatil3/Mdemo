import { test, expect } from "../fixtures/base.fixture.js";
import { LoginPage } from "../pages/LoginPage.js";
import { AdminDashboardPage } from "../pages/AdminDashboardPage.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe.serial("Admin - Manage Users Suite", () => {
  let page;
  let adminPage;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    adminPage = new AdminDashboardPage(page);

    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);
    await adminPage.expectPageLoaded();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("TC-MANAGE-01: View users table with registered status badges", async () => {
    await adminPage.openManageUsers();
    await expect(adminPage.manageUsersTable.tableTitle).toBeVisible();

    // Verify admin, plus, and pro users appear in table
    await adminPage.manageUsersTable.expectUserPresent(usersData.admin.email);
    await adminPage.manageUsersTable.expectUserPresent(usersData.plus.email);
    await adminPage.manageUsersTable.expectUserPresent(usersData.pro.email);
  });

  test("TC-MANAGE-02: Self-deletion guardrail prevents logged-in admin from deleting themselves", async () => {
    const isProtected = await adminPage.manageUsersTable.isSelfProtected(usersData.admin.email);
    expect(isProtected).toBe(true);

    const adminRow = adminPage.manageUsersTable.getRowByEmail(usersData.admin.email);
    await expect(adminRow.locator("button:has-text('Delete')")).not.toBeVisible();
  });

  test("TC-MANAGE-03: Close Manage Users section using ✕ button", async () => {
    await adminPage.manageUsersTable.close();
    await expect(adminPage.manageUsersTable.tableTitle).not.toBeVisible();
  });
});
