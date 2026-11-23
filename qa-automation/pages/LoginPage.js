import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.locator("h2:has-text('Login')");
    this.emailInput = page.locator("input[type='email']");
    this.passwordInput = page.locator("input[type='password']");
    this.loginButton = page.locator("button[type='submit']:has-text('Login')");
    this.signupLink = page.locator("a:has-text('Signup')");
  }

  async goto() {
    await super.goto("/login");
  }

  async login(email, password) {
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async clickSignupLink() {
    await this.signupLink.click();
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
