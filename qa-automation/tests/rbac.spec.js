import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe("Role-Based Access Control (RBAC) Matrix Tests", () => {
  test("TC-RBAC-01: Plus user view-only permissions (read-only for orgs & buildings, no delete/create/edit)", async ({
    loginPage,
    navbar,
    homePage,
    organizationsPage,
    buildingsPage,
    page,
  }) => {
    // 1. Log in with Plus user credentials
    await loginPage.goto();
    await loginPage.login(usersData.plus.email, usersData.plus.password);
    await homePage.verifyDashboardBadge("Plus");

    // 2. Verify Plus navbar tabs (Home, Organizations, Buildings) and absence of Users tab
    await expect(navbar.homeTab).toBeVisible();
    await expect(navbar.organizationsTab).toBeVisible();
    await expect(navbar.buildingsTab).toBeVisible();
    await expect(navbar.usersTab).not.toBeVisible();

    // 3. Navigate to Organizations tab
    await navbar.goToOrganizations();
    await expect(page).toHaveURL(/.*tab=organizations/);

    // Verify Add Organization button is NOT visible for Plus user
    await expect(organizationsPage.addOrgButton).not.toBeVisible();

    // Verify Organization cards have no Delete buttons
    await expect(page.locator("button:has-text('Delete')")).not.toBeVisible();

    // Check if there is an organization card to open
    const orgCount = await organizationsPage.orgCards.count();
    if (orgCount > 0) {
      await organizationsPage.clickEditOrg(0);
      await expect(page).toHaveURL(/.*\/organizations\/.*\/edit|.*org=/);

      // Verify organization name input is read-only / disabled
      const nameInput = page.locator("form input[placeholder*='Name' i]").first();
      if (await nameInput.count() > 0) {
        await expect(nameInput).toBeDisabled();
      }

      // Verify Save Changes button is hidden
      await expect(page.locator("button:has-text('Save Changes')")).not.toBeVisible();

      // Verify Add Building button inside Edit Org is hidden for Plus
      await expect(page.locator("button:has-text('Add Building')")).not.toBeVisible();

      // Return to organizations
      await page.locator("button:has-text('Back')").first().click();
    }

    // 4. Navigate to Buildings tab
    await navbar.goToBuildings();
    await expect(page).toHaveURL(/.*tab=buildings/);

    // Verify Delete buttons are not visible on building cards
    await expect(page.locator("button:has-text('Delete')")).not.toBeVisible();

    // 5. Try accessing users tab directly via URL parameter
    await page.goto("/dashboard?tab=users");
    await expect(page.locator("h3:has-text('Manage Users')")).not.toBeVisible();

    await navbar.logout();
  });

  test("TC-RBAC-02: Pro user edit permissions (can edit org & building details, add buildings, but cannot delete)", async ({
    loginPage,
    navbar,
    homePage,
    organizationsPage,
    buildingsPage,
    page,
  }) => {
    // 1. Log in with Pro user credentials
    await loginPage.goto();
    await loginPage.login(usersData.pro.email, usersData.pro.password);
    await homePage.verifyDashboardBadge("Pro");

    // 2. Verify Pro navbar tabs (Home, Organizations, Buildings) and absence of Users tab
    await expect(navbar.homeTab).toBeVisible();
    await expect(navbar.organizationsTab).toBeVisible();
    await expect(navbar.buildingsTab).toBeVisible();
    await expect(navbar.usersTab).not.toBeVisible();

    // 3. Navigate to Organizations tab
    await navbar.goToOrganizations();
    await expect(page).toHaveURL(/.*tab=organizations/);

    // Verify Add Organization button is NOT visible for Pro user
    await expect(organizationsPage.addOrgButton).not.toBeVisible();

    // Verify Organization cards have no Delete buttons for Pro user
    await expect(page.locator("button:has-text('Delete')")).not.toBeVisible();

    // Check edit functionality on organization
    const orgCount = await organizationsPage.orgCards.count();
    if (orgCount > 0) {
      await organizationsPage.clickEditOrg(0);
      await expect(page).toHaveURL(/.*\/organizations\/.*\/edit|.*org=/);

      // Verify name input is editable (not disabled)
      const nameInput = page.locator("form input[placeholder*='Name' i]").first();
      await expect(nameInput).toBeEnabled();

      // Verify Save button is visible and active
      await expect(organizationsPage.saveChangesButton).toBeVisible();

      // Verify Add Building button inside Edit Org IS visible for Pro user
      await expect(organizationsPage.addBuildingInOrgButton).toBeVisible();

      // Verify no Delete button exists in Edit Org
      await expect(organizationsPage.deleteOrgButton).not.toBeVisible();

      // Go back
      await page.locator("button:has-text('Back')").first().click();
    }

    // 4. Navigate to Buildings tab
    await navbar.goToBuildings();
    await expect(page).toHaveURL(/.*tab=buildings/);

    // Verify Building cards do NOT have Delete buttons for Pro user
    await expect(page.locator("button:has-text('Delete')")).not.toBeVisible();

    // Verify Edit Building allows editing details
    const bldgCount = await buildingsPage.buildingCards.count();
    if (bldgCount > 0) {
      await buildingsPage.clickEditBuilding(0);
      await expect(page).toHaveURL(/.*\/buildings\/.*\/edit|.*building=/);

      const bldgNameInput = page.locator("form input[placeholder*='Building Name' i]").first();
      await expect(bldgNameInput).toBeEnabled();

      await expect(buildingsPage.saveChangesButton).toBeVisible();

      // Verify Delete Building button is NOT visible for Pro user
      await expect(buildingsPage.deleteBuildingButton).not.toBeVisible();

      await page.locator("button:has-text('Back')").first().click();
    }

    await navbar.logout();
  });

  test("TC-RBAC-03: Admin user full CRUD permissions (unrestricted access across all tabs)", async ({
    loginPage,
    navbar,
    homePage,
    organizationsPage,
    page,
  }) => {
    // 1. Log in with Admin user credentials
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await homePage.verifyDashboardBadge("Admin");

    // 2. Verify all tabs are visible including Users
    await expect(navbar.homeTab).toBeVisible();
    await expect(navbar.organizationsTab).toBeVisible();
    await expect(navbar.buildingsTab).toBeVisible();
    await expect(navbar.usersTab).toBeVisible();

    // 3. Verify Admin can add organizations
    await navbar.goToOrganizations();
    await expect(organizationsPage.addOrgButton).toBeVisible({ timeout: 15000 });

    // 4. Verify Admin can access Edit Org and see Add Building & Delete Organization
    const orgCount = await organizationsPage.orgCards.count();
    if (orgCount > 0) {
      await organizationsPage.clickEditOrg(0);
      await expect(organizationsPage.addBuildingInOrgButton).toBeVisible();
      await expect(organizationsPage.deleteOrgButton).toBeVisible();
      await page.locator("button:has-text('Back')").first().click();
    }

    // 5. Verify Users tab is fully accessible
    await navbar.goToUsers();
    await expect(page).toHaveURL(/.*tab=users/);
    await expect(page.locator("h3:has-text('Manage Users'), h3:has-text('Add User')").first()).toBeVisible({ timeout: 15000 });

    await navbar.logout();
  });
});
