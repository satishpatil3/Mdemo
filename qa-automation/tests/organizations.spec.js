import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe.serial("Organizations Management Suite", () => {
  const newOrgName = "Bharat Tech Corp " + Date.now().toString().slice(-4);

  test("TC-ORG-01: Display sample organizations with uniform cards layout", async ({
    loginPage,
    navbar,
    organizationsPage,
    page
  }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    await navbar.goToOrganizations();

    // Verify organization cards exist and display title and structure via CSS locators
    const cards = organizationsPage.orgCards;
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    await expect(cards).not.toHaveCount(0);

    // Verify card structural components (header title, category/badge)
    const firstCard = cards.first();
    await expect(firstCard.locator("h3")).toBeVisible();

    await navbar.logout();
  });

  test("TC-ORG-02: Search & filter organizations dynamically", async ({
    loginPage,
    navbar,
    organizationsPage,
    page
  }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    await navbar.goToOrganizations();
    await expect(organizationsPage.orgCards.first()).toBeVisible({ timeout: 15000 });

    // Dynamically retrieve the first organization title instead of hardcoding company names
    const firstOrgTitle = (await organizationsPage.orgCards.first().locator("h3").innerText()).trim();
    const queryTerm = firstOrgTitle.split(" ")[0];

    // Search by dynamic query
    await organizationsPage.search(queryTerm);
    await expect(organizationsPage.orgCards.first().locator("h3")).toContainText(queryTerm);

    // Search by non-existent query
    await organizationsPage.search("NonExistentRandom999");
    await expect(page.locator("text=No organizations found")).toBeVisible();

    // Clear search
    await organizationsPage.search("");
    await expect(organizationsPage.orgCards.first().locator("h3")).toContainText(queryTerm);

    await navbar.logout();
  });

  test("TC-ORG-03: Admin creates a new organization (Name only modal)", async ({
    loginPage,
    navbar,
    organizationsPage,
    toast,
    page
  }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    await navbar.goToOrganizations();
    await expect(organizationsPage.orgCards.first()).toBeVisible({ timeout: 15000 });

    // Create organization with fictional dummy name
    await organizationsPage.createOrganization(newOrgName);
    await toast.expectSuccess(`Organization "${newOrgName}" created successfully!`);

    // Verify card is added
    await expect(page.locator(`div[role='button']:has(h3:has-text('${newOrgName}'))`)).toBeVisible({ timeout: 15000 });

    await navbar.logout();
  });

  test("TC-ORG-04: Non-Admin cannot add organization", async ({
    loginPage,
    navbar,
    organizationsPage,
    page
  }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
    await loginPage.login(usersData.pro.email, usersData.pro.password);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    await navbar.goToOrganizations();
    await expect(organizationsPage.orgCards.first()).toBeVisible({ timeout: 15000 });

    // Add organization button must be hidden for Pro
    await expect(organizationsPage.addOrgButton).toHaveCount(0);

    await navbar.logout();
  });

  test("TC-ORG-05: Edit organization details & specialization", async ({
    loginPage,
    navbar,
    organizationsPage,
    toast,
    page
  }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    await navbar.goToOrganizations();
    await expect(organizationsPage.orgCards.first()).toBeVisible({ timeout: 15000 });
    await organizationsPage.openOrganization(newOrgName);

    // Verify URL
    await expect(page).toHaveURL(/.*org=/);

    // Update specialization using structural input locator
    await organizationsPage.editSpecializationInput.fill("AI & Robotics");
    await organizationsPage.saveChangesButton.click();

    await toast.expectSuccess(`Organization "${newOrgName}" updated successfully!`);

    // Automatically redirected back to cards list on save; verify updated specialization badge
    await expect(page.locator(`div:has(h3:has-text('${newOrgName}')) >> text=AI & Robotics`)).toBeVisible({ timeout: 15000 });

    await navbar.logout();
  });

  test("TC-ORG-06: Admin deletes organization without browser alert prompts", async ({
    loginPage,
    navbar,
    organizationsPage,
    toast,
    page
  }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    await navbar.goToOrganizations();
    await expect(organizationsPage.orgCards.first()).toBeVisible({ timeout: 15000 });
    await organizationsPage.openOrganization(newOrgName);

    // Delete organization (should delete directly with toast, without alert dialog)
    await organizationsPage.deleteOrgButton.click();
    await toast.expectSuccess(`Organization "${newOrgName}" deleted`);

    // Verify card is removed
    await expect(page.locator(`div[role='button']:has(h3:has-text('${newOrgName}'))`)).toHaveCount(0);

    await navbar.logout();
  });

  test("TC-ORG-07: Browser Back button returns to Organizations grid", async ({
    loginPage,
    navbar,
    organizationsPage,
    page
  }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    await navbar.goToOrganizations();
    await expect(organizationsPage.orgCards.first()).toBeVisible({ timeout: 15000 });

    // Open first organization dynamically using structural index
    const firstOrg = organizationsPage.orgCards.first();
    const firstOrgTitle = (await firstOrg.locator("h3").innerText()).trim();
    await firstOrg.click();
    await expect(page).toHaveURL(/.*org=/);

    // Press browser back button
    await page.goBack();
    await expect(page).toHaveURL(/.*tab=organizations$/);
    await expect(page.locator(`div[role='button']:has(h3:has-text('${firstOrgTitle}'))`)).toBeVisible({ timeout: 15000 });

    await navbar.logout();
  });
});
