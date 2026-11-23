import { test, expect } from "../fixtures/base.fixture.js";
import usersData from "../test-data/users.json" with { type: "json" };
import invalidData from "../test-data/invalid-data.json" with { type: "json" };

test.describe("Authentication - Signup Suite", () => {
  test.beforeEach(async ({ signupPage }) => {
    await signupPage.goto();
    await signupPage.expectPageLoaded();
  });

  test("TC-SIGNUP-01: Show warning if email or password is empty", async ({
    signupPage,
    toast
  }) => {
    await signupPage.signup(
      invalidData.emptyCredentials.email,
      invalidData.emptyCredentials.password
    );
    await toast.expectWarning("Please enter email and password");
  });

  test("TC-SIGNUP-02: Show warning if password is less than 6 characters", async ({
    signupPage,
    toast
  }) => {
    await signupPage.signup(
      invalidData.shortPassword.email,
      invalidData.shortPassword.password
    );
    await toast.expectWarning("Password must be at least 6 characters");
  });

  test("TC-SIGNUP-03: Inform user and redirect to login if account is already registered", async ({
    signupPage,
    toast,
    page
  }) => {
    // Attempting signup with existing plus user
    await signupPage.signup(usersData.plus.email, usersData.plus.password);

    await toast.expectMessage("Email is already registered. Please go to Login.");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("TC-SIGNUP-04: Click 'Login' link navigates to /login page", async ({
    signupPage,
    loginPage,
    page
  }) => {
    await signupPage.clickLoginLink();
    await expect(page).toHaveURL(/.*\/login/);
    await loginPage.expectPageLoaded();
  });
});
