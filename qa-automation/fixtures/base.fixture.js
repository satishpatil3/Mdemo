import { test as baseTest, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { SignupPage } from "../pages/SignupPage.js";
import { DashboardPage } from "../pages/DashboardPage.js";
import { AdminDashboardPage } from "../pages/AdminDashboardPage.js";
import { PlusDashboardPage } from "../pages/PlusDashboardPage.js";
import { ProDashboardPage } from "../pages/ProDashboardPage.js";
import { HomePage } from "../pages/HomePage.js";
import { OrganizationsPage } from "../pages/OrganizationsPage.js";
import { BuildingsPage } from "../pages/BuildingsPage.js";
import { Toast } from "../components/Toast.js";
import { Navbar } from "../components/Navbar.js";

export const test = baseTest.extend({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  adminPage: async ({ page }, use) => use(new AdminDashboardPage(page)),
  plusPage: async ({ page }, use) => use(new PlusDashboardPage(page)),
  proPage: async ({ page }, use) => use(new ProDashboardPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  organizationsPage: async ({ page }, use) => use(new OrganizationsPage(page)),
  buildingsPage: async ({ page }, use) => use(new BuildingsPage(page)),
  toast: async ({ page }, use) => use(new Toast(page)),
  navbar: async ({ page }, use) => use(new Navbar(page))
});

export { expect };
