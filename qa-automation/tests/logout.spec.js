import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };

test.describe("Authentication - Logout & Session Guards", () => {
  test("TC-LOGOUT-01: Successfully logout from Dashboard", async ({
    loginPage,
    navbar,
    page
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.plus.email, usersData.plus.password);
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Logout
    await navbar.logout();
    await expect(page).toHaveURL(/.*(\/|\/login)$/);

    // Verify session revoked: visiting /dashboard redirects to /login
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("TC-LOGOUT-02: Protected route redirects unauthenticated user to /login", async ({
    page
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
  });
});
