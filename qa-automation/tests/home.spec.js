import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe("Home Dashboard & Navbar Navigation Suite", () => {
  test("TC-HOME-01: Unified Navbar layout & active tab underline", async ({
    loginPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    // Verify brand title and dashboard badge
    await expect(navbar.brandTitle).toHaveText("FirebaseApp");
    await expect(navbar.adminDashboardBtn).toBeVisible();

    // Verify all 4 tabs are present for admin
    await expect(navbar.homeTab).toBeVisible();
    await expect(navbar.organizationsTab).toBeVisible();
    await expect(navbar.buildingsTab).toBeVisible();
    await expect(navbar.usersTab).toBeVisible();

    // Click tabs and verify active underline styling (border-white)
    await navbar.goToOrganizations();
    await expect(navbar.organizationsTab).toHaveClass(/border-white/);
    await expect(page).toHaveURL(/.*tab=organizations/);

    await navbar.goToBuildings();
    await expect(navbar.buildingsTab).toHaveClass(/border-white/);
    await expect(page).toHaveURL(/.*tab=buildings/);

    await navbar.goToHome();
    await expect(navbar.homeTab).toHaveClass(/border-white/);

    await navbar.logout();
  });

  test("TC-HOME-02: Metric Overview cards display accurate counts on Home", async ({
    loginPage,
    homePage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    // Verify 3 overview cards are displayed
    await homePage.expectOverviewLoaded();

    // Verify old cards are not present on Home tab
    await expect(page.locator("h3:has-text('View Projects')")).toHaveCount(0);
    await expect(page.locator("h3:has-text('Create Project')")).toHaveCount(0);
    await expect(page.locator("h3:has-text('Advanced Analytics')")).toHaveCount(0);

    await navbar.logout();
  });

  test("TC-HOME-03: Navigate to tabs via Home metric overview cards", async ({
    loginPage,
    homePage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    // Click Total Organizations card
    await homePage.clickTotalOrgs();
    await expect(page).toHaveURL(/.*tab=organizations/);

    // Return to Home
    await navbar.goToHome();

    // Click Total Buildings card
    await homePage.clickTotalBuildings();
    await expect(page).toHaveURL(/.*tab=buildings/);

    // Return to Home
    await navbar.goToHome();

    // As Admin, click Total Users card
    await homePage.clickTotalUsers();
    await expect(page).toHaveURL(/.*tab=users/);

    await navbar.logout();
  });

  test("TC-HOME-04: Top-right Dashboard button navigates to Home tab", async ({
    loginPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    // Navigate away to Buildings tab
    await navbar.goToBuildings();
    await expect(page).toHaveURL(/.*tab=buildings/);

    // Click top-right Admin Dashboard button
    await navbar.clickDashboard();
    await expect(page).toHaveURL(/.*tab=home/);

    await navbar.logout();
  });
});
