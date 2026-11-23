import { test as baseTest } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { SignupPage } from "../pages/SignupPage.js";
import { DashboardPage } from "../pages/DashboardPage.js";
import { AdminDashboardPage } from "../pages/AdminDashboardPage.js";
import { PlusDashboardPage } from "../pages/PlusDashboardPage.js";
import { ProDashboardPage } from "../pages/ProDashboardPage.js";
import { Toast } from "../components/Toast.js";
import { Navbar } from "../components/Navbar.js";

export const test = baseTest.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  adminPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },

  plusPage: async ({ page }, use) => {
    await use(new PlusDashboardPage(page));
  },

  proPage: async ({ page }, use) => {
    await use(new ProDashboardPage(page));
  },

  toast: async ({ page }, use) => {
    await use(new Toast(page));
  },

  navbar: async ({ page }, use) => {
    await use(new Navbar(page));
  }
});

export { expect } from "@playwright/test";
