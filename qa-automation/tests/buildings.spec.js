import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe.serial("Buildings Management Suite", () => {
  const newBuildingName = "Bharat Tech Lab " + Date.now().toString().slice(-4);

  test("TC-BLDG-01: Display registered buildings with facility icon and card layout", async ({
    loginPage,
    navbar,
    buildingsPage,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    await navbar.goToBuildings();

    // Verify building cards exist and display proper structure using CSS locators
    const cards = buildingsPage.buildingCards;
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    await expect(cards).not.toHaveCount(0);

    // Verify card structural components (building title, floor badge, address)
    const firstCard = cards.first();
    await expect(firstCard.locator("h4")).toBeVisible();
    await expect(firstCard.locator("p.text-xs, p.text-sm").first()).toBeVisible();

    await navbar.logout();
  });

  test("TC-BLDG-02: Filter buildings by Organization dropdown", async ({
    loginPage,
    navbar,
    buildingsPage,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    await navbar.goToBuildings();
    await expect(buildingsPage.buildingCards.first()).toBeVisible({ timeout: 15000 });

    // Dynamically retrieve the second option in the dropdown (first is 'All Organizations')
    const options = buildingsPage.orgFilterSelect.locator("option");
    await expect(options.nth(1)).toBeAttached({ timeout: 15000 });
    const optionCount = await options.count();
    if (optionCount > 1) {
      const targetOrg = (await options.nth(1).innerText()).trim();
      await buildingsPage.filterByOrganization(targetOrg);

      // Verify filtered cards are visible
      await expect(buildingsPage.buildingCards.first()).toBeVisible({ timeout: 15000 });

      // Verify "Showing buildings for:" text is not present (removed per design)
      await expect(page.locator("text=Showing buildings for")).toHaveCount(0);

      // Reset filter to All
      await buildingsPage.filterByOrganization("");
      await expect(buildingsPage.buildingCards.first()).toBeVisible({ timeout: 15000 });
    }

    await navbar.logout();
  });

  test("TC-BLDG-03: Pro & Admin add building inside Organization Edit view", async ({
    loginPage,
    navbar,
    organizationsPage,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.pro.email, usersData.pro.password);
    await page.waitForURL(/.*\/dashboard/);

    await navbar.goToOrganizations();
    await expect(organizationsPage.orgCards.first()).toBeVisible({ timeout: 15000 });

    // Open first organization dynamically using CSS selector
    await organizationsPage.orgCards.first().click();

    // Pro clicks Add Building inside organization view
    await expect(organizationsPage.addBuildingInOrgButton).toBeVisible({ timeout: 10000 });
    await organizationsPage.addBuildingFromOrg(newBuildingName);

    // Automatically redirected to buildings tab with the new building immediately visible
    await expect(page).toHaveURL(/.*tab=buildings/);
    await expect(page.locator(`div[role='button']:has(h4:has-text('${newBuildingName}'))`)).toBeVisible({ timeout: 15000 });

    await navbar.logout();
  });

  test("TC-BLDG-04: Edit building floors directory", async ({
    loginPage,
    navbar,
    buildingsPage,
    toast,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.pro.email, usersData.pro.password);
    await page.waitForURL(/.*\/dashboard/);

    await navbar.goToBuildings();
    await expect(buildingsPage.buildingCards.first()).toBeVisible({ timeout: 15000 });
    await buildingsPage.openBuilding(newBuildingName);

    // Add new floor
    await buildingsPage.addNewFloor("Executive Sky Deck");
    await buildingsPage.saveChangesButton.click();

    await toast.expectSuccess(`Building "${newBuildingName}" updated successfully!`);

    await navbar.logout();
  });

  test("TC-BLDG-05: Admin deletes building without alert prompts", async ({
    loginPage,
    navbar,
    buildingsPage,
    toast,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    await navbar.goToBuildings();
    await expect(buildingsPage.buildingCards.first()).toBeVisible({ timeout: 15000 });
    await buildingsPage.openBuilding(newBuildingName);

    // Admin deletes building
    await expect(buildingsPage.deleteBuildingButton).toBeVisible({ timeout: 10000 });
    await buildingsPage.deleteBuildingButton.click();

    await toast.expectSuccess(`Building "${newBuildingName}" deleted successfully!`);
    await expect(page.locator(`div[role='button']:has(h4:has-text('${newBuildingName}'))`)).toHaveCount(0);

    await navbar.logout();
  });

  test("TC-BLDG-06: Browser Back button from building returns to buildings list", async ({
    loginPage,
    navbar,
    buildingsPage,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await page.waitForURL(/.*\/dashboard/);

    await navbar.goToBuildings();
    await expect(page).toHaveURL(/.*tab=buildings/);
    await expect(buildingsPage.orgFilterSelect).toBeVisible({ timeout: 15000 });
    await expect(buildingsPage.buildingCards.first()).toBeVisible({ timeout: 15000 });

    // Open first building card dynamically using structural CSS selector
    const firstCard = buildingsPage.buildingCards.first();
    const firstBuildingTitle = (await firstCard.locator("h4").innerText()).trim();
    await firstCard.click();
    await expect(page).toHaveURL(/.*building=/);

    // Press browser back button
    await page.goBack();
    await expect(page).toHaveURL(/.*tab=buildings$/);
    await expect(page.locator(`div[role='button']:has(h4:has-text('${firstBuildingTitle}'))`)).toBeVisible({ timeout: 15000 });

    await navbar.logout();
  });
});
