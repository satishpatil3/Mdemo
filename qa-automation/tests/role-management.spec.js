import { test, expect } from "../fixtures/base.fixture.js";
import { LoginPage } from "../pages/LoginPage.js";
import { AdminDashboardPage } from "../pages/AdminDashboardPage.js";
import { Toast } from "../components/Toast.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe.serial("Admin - Role Management Suite", () => {
  let page;
  let adminPage;
  let toast;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    adminPage = new AdminDashboardPage(page);
    toast = new Toast(page);

    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);
    await adminPage.expectPageLoaded();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("TC-ROLE-01: Self-demotion guardrail prevents logged-in admin from altering own role", async () => {
    await adminPage.openRoleManagement();

    // Verify admin row shows 'You (Self)'
    const isSelf = await adminPage.roleManagementSection.isSelfProtected(usersData.admin.email);
    expect(isSelf).toBe(true);

    // Attempting to submit admin's own email triggers error toast
    await adminPage.roleManagementSection.changeRole(usersData.admin.email, "plus");
    await toast.expectError(
      "You cannot change your own access level to prevent locking yourself out of Admin Dashboard."
    );
  });

  test("TC-ROLE-02: Admin successfully updates role of a registered user", async () => {
    // Select Plus user to edit
    await adminPage.roleManagementSection.selectUserToEdit(usersData.plus.email);

    // Update role to pro
    await adminPage.roleManagementSection.changeRole(usersData.plus.email, "pro");
    await toast.expectSuccess(`User ${usersData.plus.email} role changed to PRO successfully!`);

    // Reset back to plus to maintain clean state
    await adminPage.roleManagementSection.selectUserToEdit(usersData.plus.email);
    await adminPage.roleManagementSection.changeRole(usersData.plus.email, "plus");
    await toast.expectSuccess(`User ${usersData.plus.email} role changed to PLUS successfully!`);
  });

  test("TC-ROLE-03: Close Role Management section using ✕ button", async () => {
    await adminPage.roleManagementSection.close();
    await expect(adminPage.roleManagementSection.sectionTitle).not.toBeVisible();
  });
});
