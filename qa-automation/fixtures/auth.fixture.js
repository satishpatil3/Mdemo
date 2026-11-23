import { test as base } from "./base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };

export const test = base.extend({
  // Auto-logs in as Admin before running test
  adminContext: async ({ page, loginPage, adminPage }, use) => {
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await adminPage.expectPageLoaded();
    await use({ page, adminPage });
  },

  // Auto-logs in as Plus User before running test
  plusUserContext: async ({ page, loginPage, plusPage }, use) => {
    await loginPage.goto();
    await loginPage.login(usersData.plus.email, usersData.plus.password);
    await plusPage.expectPageLoaded();
    await use({ page, plusPage });
  },

  // Auto-logs in as Pro User before running test
  proUserContext: async ({ page, loginPage, proPage }, use) => {
    await loginPage.goto();
    await loginPage.login(usersData.pro.email, usersData.pro.password);
    await proPage.expectPageLoaded();
    await use({ page, proPage });
  }
});

export { expect } from "@playwright/test";
