import { test, expect } from "../fixtures/base.fixture.js";
import { LoginPage } from "../pages/LoginPage.js";
import { SignupPage } from "../pages/SignupPage.js";
import { DashboardPage } from "../pages/DashboardPage.js";
import { AdminDashboardPage } from "../pages/AdminDashboardPage.js";
import { Navbar } from "../components/Navbar.js";
import { Toast } from "../components/Toast.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe.serial("End-to-End User Lifecycle Suite", () => {
  let page;
  let loginPage;
  let signupPage;
  let dashboardPage;
  let adminPage;
  let navbar;
  let toast;

  // Fixed static user credentials from users.json
  const testUser = usersData.newUser;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
    dashboardPage = new DashboardPage(page);
    adminPage = new AdminDashboardPage(page);
    navbar = new Navbar(page);
    toast = new Toast(page);

    // Self-healing pre-cleanup: Ensure user doesn't exist from a previous interrupted run
    await loginPage.goto();
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await adminPage.openManageUsers();
    const existingRow = adminPage.manageUsersTable.getRowByEmail(testUser.email);
    if ((await existingRow.count()) > 0) {
      await adminPage.manageUsersTable.deleteUser(testUser.email);
      await page.waitForTimeout(500);
    }
    await adminPage.manageUsersTable.close();
    await navbar.logout();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("Step 1: Brand new user signs up on /signup", async () => {
    await signupPage.goto();
    await signupPage.expectPageLoaded();

    await signupPage.signup(testUser.email, testUser.password);

    // Verify success toast and redirection to login
    await toast.expectSuccess("Account Created with PLUS Role! Please login.");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("Step 2: New user logs in and verifies default Plus Dashboard", async () => {
    await loginPage.login(testUser.email, testUser.password);

    await expect(page).toHaveURL(/.*\/dashboard/);
    await dashboardPage.expectPlusDashboard();

    // Logout to prepare for Admin actions
    await navbar.logout();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("Step 3: Admin logs in and upgrades new user role to PRO", async () => {
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/);
    await adminPage.expectPageLoaded();

    // Open Role Management
    await adminPage.openRoleManagement();

    // Change new user's role to PRO
    await adminPage.roleManagementSection.changeRole(testUser.email, "pro");
    await toast.expectSuccess(`User ${testUser.email} role changed to PRO successfully!`);

    // Close Role Management & logout Admin
    await adminPage.roleManagementSection.close();
    await navbar.logout();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("Step 4: User logs in again and verifies upgraded Pro Dashboard access", async () => {
    await loginPage.login(testUser.email, testUser.password);

    await expect(page).toHaveURL(/.*\/dashboard/);
    await dashboardPage.expectProDashboard();

    // Logout
    await navbar.logout();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("Step 5: Admin logs in, deletes the user, and verifies removal", async () => {
    await loginPage.login(usersData.admin.email, usersData.admin.password);
    await expect(page).toHaveURL(/.*\/dashboard/);
    await adminPage.expectPageLoaded();

    // Open Manage Users
    await adminPage.openManageUsers();

    // Confirm new user is present in table
    await adminPage.manageUsersTable.expectUserPresent(testUser.email);

    // Delete the new user
    await adminPage.manageUsersTable.deleteUser(testUser.email);
    await toast.expectSuccess("User deleted successfully");

    // Verify the user is no longer in the table
    await adminPage.manageUsersTable.expectUserNotPresent(testUser.email);

    // Close Manage Users & logout Admin
    await adminPage.manageUsersTable.close();
    await navbar.logout();
  });
});
