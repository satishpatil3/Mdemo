import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe("Dashboard - Role Views Suite", () => {
  test("TC-VIEWS-01: Admin Dashboard displays Admin badge in Navbar and administrative features", async ({
    loginPage,
    adminPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    // Verify Admin Dashboard label in Navbar and Home overview metrics
    await adminPage.expectPageLoaded();
    await expect(navbar.adminDashboardBtn).toBeVisible();
    await expect(navbar.usersTab).toBeVisible();

    // Verify Users tab features
    await adminPage.goToUsersTab();
    await expect(adminPage.addUserCard).toBeVisible();
    await expect(adminPage.manageUsersCard).toBeVisible();
    await expect(adminPage.roleManagementCard).toBeVisible();

    // Verify old cards are completely removed
    await adminPage.goToHomeTab();
    await expect(page.locator("h3:has-text('View Projects')")).toHaveCount(0);
    await expect(page.locator("h3:has-text('Analytics')")).toHaveCount(0);

    await navbar.logout();
  });

  test("TC-VIEWS-02: Plus Dashboard displays Plus badge in Navbar and clean Home metrics", async ({
    loginPage,
    plusPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.plus.email, usersData.plus.password);
    await page.waitForURL(/.*\/dashboard/);

    // Verify Plus Dashboard label in Navbar and Home cards
    await plusPage.expectPageLoaded();
    await expect(navbar.plusDashboardBtn).toBeVisible();

    // Verify Users tab is hidden for Plus
    await expect(navbar.usersTab).toHaveCount(0);

    // Verify old workspace feature cards are completely removed
    await expect(page.locator("h3:has-text('View Projects')")).toHaveCount(0);
    await expect(page.locator("h3:has-text('Create Project')")).toHaveCount(0);
    await expect(page.locator("h3:has-text('Basic Reports')")).toHaveCount(0);

    await navbar.logout();
  });

  test("TC-VIEWS-03: Pro Dashboard displays Pro badge in Navbar and clean Home metrics", async ({
    loginPage,
    proPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.pro.email, usersData.pro.password);
    await page.waitForURL(/.*\/dashboard/);

    // Verify Pro Dashboard label in Navbar and Home cards
    await proPage.expectPageLoaded();
    await expect(navbar.proDashboardBtn).toBeVisible();

    // Verify Users tab is hidden for Pro
    await expect(navbar.usersTab).toHaveCount(0);

    // Verify old workspace feature cards are completely removed
    await expect(page.locator("h3:has-text('View Projects')")).toHaveCount(0);
    await expect(page.locator("h3:has-text('Create Project')")).toHaveCount(0);
    await expect(page.locator("h3:has-text('Advanced Analytics')")).toHaveCount(0);
    await expect(page.locator("h3:has-text('Export Reports')")).toHaveCount(0);

    await navbar.logout();
  });
});
