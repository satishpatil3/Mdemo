import { BasePage } from "./BasePage.js";
import { expect } from "@playwright/test";

export class SignupPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.locator("h2:has-text('Signup')");
    this.emailInput = page.locator("input[type='email']");
    this.passwordInput = page.locator("input[type='password']");
    this.createAccountButton = page.locator("button[type='submit']:has-text('Create Account')");
    this.loginLink = page.locator("a:has-text('Login')");
  }

  async goto() {
    await super.goto("/signup");
  }

  async signup(email, password) {
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
    await this.createAccountButton.click();
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.createAccountButton).toBeVisible();
  }
}
