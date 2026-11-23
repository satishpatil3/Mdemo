import { test, expect } from "../fixtures/base.fixture.js";
import { LoginPage } from "../pages/LoginPage.js";
import { AdminDashboardPage } from "../pages/AdminDashboardPage.js";
import { Toast } from "../components/Toast.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe.serial("Admin - Add User Suite", () => {
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

  test("TC-ADDUSER-01: Admin opens modal and verifies role selection options", async () => {
    await adminPage.openAddUser();

    await expect(adminPage.addUserModal.plusRadio).toBeVisible();
    await expect(adminPage.addUserModal.proRadio).toBeVisible();
    await expect(adminPage.addUserModal.adminRadio).toBeVisible();

    await adminPage.addUserModal.close();
    await adminPage.addUserModal.expectHidden();
  });

  test("TC-ADDUSER-02: Prevent adding user if email already exists in database", async () => {
    await adminPage.openAddUser();

    await adminPage.addUserModal.fillForm({
      name: "Existing Plus User",
      email: usersData.plus.email,
      role: "plus"
    });
    await adminPage.addUserModal.submit();

    await toast.expectError(`User with email "${usersData.plus.email}" already exists`);
    await adminPage.addUserModal.close();
  });

  test("TC-ADDUSER-03: Close Add User modal using Cancel button", async () => {
    await adminPage.openAddUser();
    await adminPage.addUserModal.cancel();
    await adminPage.addUserModal.expectHidden();
  });
});
