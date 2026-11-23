import { Navbar } from "../components/Navbar.js";
import { Toast } from "../components/Toast.js";

export class BasePage {
  constructor(page) {
    this.page = page;
    this.navbar = new Navbar(page);
    this.toast = new Toast(page);
  }

  async goto(path = "/") {
    await this.page.goto(path);
  }

  async waitForUrl(urlPattern) {
    await this.page.waitForURL(new RegExp(urlPattern));
  }

  async getTitle() {
    return await this.page.title();
  }
}
