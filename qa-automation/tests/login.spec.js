import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };
import invalidData from "../test-data/invalid-data.json" with { type: "json" };

test.describe("Authentication - Login Suite", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
  });

  test("TC-LOGIN-01: Admin user logs in and accesses Admin Dashboard", async ({
    loginPage,
    dashboardPage,
    navbar,
    page
  }) => {
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/);
    await dashboardPage.expectAdminDashboard();
    await navbar.logout();
  });

  test("TC-LOGIN-02: Plus user logs in and accesses Plus Dashboard", async ({
    loginPage,
    dashboardPage,
    navbar,
    page
  }) => {
    await loginPage.login(usersData.plus.email, usersData.plus.password);
    await expect(page).toHaveURL(/.*\/dashboard/);
    await dashboardPage.expectPlusDashboard();
    await navbar.logout();
  });

  test("TC-LOGIN-03: Pro user logs in and accesses Pro Dashboard", async ({
    loginPage,
    dashboardPage,
    navbar,
    page
  }) => {
    await loginPage.login(usersData.pro.email, usersData.pro.password);
    await expect(page).toHaveURL(/.*\/dashboard/);
    await dashboardPage.expectProDashboard();
    await navbar.logout();
  });

  test("TC-LOGIN-04: Show warning toast on empty credentials", async ({
    loginPage,
    toast
  }) => {
    await loginPage.login(
      invalidData.emptyCredentials.email,
      invalidData.emptyCredentials.password
    );
    await toast.expectWarning("Please enter email and password");
  });

  test("TC-LOGIN-05: Reject non-existent user with invalid credentials toast", async ({
    loginPage,
    toast,
    page
  }) => {
    await loginPage.login(
      invalidData.nonExistentUser.email,
      invalidData.nonExistentUser.password
    );
    await toast.expectError("Invalid email or password");
    await expect(page).toHaveURL(/.*\/login/);
  });
});
