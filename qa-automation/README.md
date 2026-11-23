# QA Automation Test Suite (Playwright + JavaScript)

Professional End-to-End (E2E) Test Automation Framework designed with the **Page Object Model (POM)** pattern, custom fixtures, and fixed test data (`users.json` / `invalid-data.json`).

---

## 📁 Architecture & Folder Structure

```
qa-automation/
│
├── components/                    # Reusable UI component wrappers
│   ├── Navbar.js                 # Global navbar component
│   ├── Toast.js                  # Toast notification assertions
│   ├── AddUserModal.js           # Add user modal popup
│   ├── ManageUsersTable.js       # Manage users table & actions
│   └── RoleManagementSection.js   # Role management section & actions
│
├── pages/                         # Page Object Model (POM) representations
│   ├── BasePage.js               # Common base page class
│   ├── LoginPage.js              # /login page object
│   ├── SignupPage.js             # /signup page object
│   ├── DashboardPage.js          # /dashboard base view router
│   ├── AdminDashboardPage.js     # Admin dashboard view
│   ├── PlusDashboardPage.js      # Plus role dashboard view
│   └── ProDashboardPage.js       # Pro role dashboard view
│
├── fixtures/                      # Playwright custom fixtures
│   ├── base.fixture.js           # Extended test runner with all Page Objects
│   └── auth.fixture.js           # Pre-authenticated context fixtures
│
├── test-data/                     # Test data & payloads (NO random generators)
│   ├── users.json                # Fixed 3 accounts: admin, plus, pro
│   └── invalid-data.json         # Negative test scenarios
│
├── utils/                         # Helper utilities
│   ├── logger.js                 # Terminal color logger
│   └── assertions.js             # Custom reusable assertions
│
├── tests/                         # All Test Suites directly in tests/
│   ├── login.spec.js             # Login tests (admin, plus, pro, validations)
│   ├── signup.spec.js            # Signup validations, existing user handling
│   ├── logout.spec.js            # Logout & protected route verification
│   ├── add-user.spec.js          # Add user modal, role radios, duplicate check
│   ├── manage-users.spec.js      # User table, status badges, self-deletion guard
│   ├── role-management.spec.js   # Role modification, self-demotion guard
│   └── role-views.spec.js        # Plus, Pro, and Admin dashboard views
│
├── playwright.config.js           # Playwright runner configuration
└── package.json                   # Scripts and dependencies
```

---

## 👥 Fixed Test Users (`test-data/users.json`)

All tests strictly use these 3 defined accounts without generating random emails or passwords:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Password123!` |
| **Plus** | `plus@example.com` | `Password123!` |
| **Pro** | `pro@example.com` | `Password123!` |

*(If your existing accounts have different emails or passwords, simply update them in `test-data/users.json`)*

---

## 🚀 How to Run Tests

Make sure the React application is running in one terminal:
```bash
# In M-demo directory
npm run dev
```

Then in the `qa-automation` directory:

```bash
# Run all tests
npm run test

# Run tests with the interactive UI Runner (Recommended for step-by-step visual execution)
npm run test:ui

# Run tests in headed browser mode
npm run test:headed

# Run specific suites
npm run test:auth
npm run test:admin
npm run test:dashboard

# View HTML test report
npm run test:report
```
