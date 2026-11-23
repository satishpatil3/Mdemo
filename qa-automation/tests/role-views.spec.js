import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe("Dashboard - Role Views Suite", () => {
  test("TC-VIEWS-01: Admin Dashboard displays all administrative feature cards", async ({
    loginPage,
    adminPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);
    await adminPage.expectPageLoaded();

    await expect(adminPage.addUserCard).toBeVisible();
    await expect(adminPage.manageUsersCard).toBeVisible();
    await expect(adminPage.roleManagementCard).toBeVisible();
    await expect(adminPage.analyticsCard).toBeVisible();
    await expect(adminPage.reportsCard).toBeVisible();
    await expect(adminPage.settingsCard).toBeVisible();

    await navbar.logout();
  });

  test("TC-VIEWS-02: Plus Dashboard displays Plus role cards", async ({
    loginPage,
    plusPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.plus.email, usersData.plus.password);
    await page.waitForURL(/.*\/dashboard/);
    await plusPage.expectPageLoaded();

    await navbar.logout();
  });

  test("TC-VIEWS-03: Pro Dashboard displays Pro role cards", async ({
    loginPage,
    proPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.pro.email, usersData.pro.password);
    await page.waitForURL(/.*\/dashboard/);
    await proPage.expectPageLoaded();

    await navbar.logout();
  });
});
