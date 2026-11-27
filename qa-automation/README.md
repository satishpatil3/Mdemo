# QA Automation Test Suite (Playwright + JavaScript)

Professional End-to-End (E2E) Test Automation Framework built with **Playwright**, **Page Object Model (POM)** pattern, pure **JavaScript (ES Modules)**, custom fixtures, and synchronized with a comprehensive **48-Test Case Manual Specification** (Excel & HTML).

---

## 📁 Architecture & Folder Structure

```
qa-automation/
│
├── components/                    # Reusable UI component wrappers
│   ├── Navbar.js                 # Global top navbar (Home, Organizations, Buildings, Users tabs & Role badges)
│   ├── Toast.js                  # Toast notification assertions (success, warning, error)
│   ├── AddUserModal.js           # Add user modal dialog
│   ├── ManageUsersTable.js       # Manage users table actions & deletion guards
│   └── RoleManagementSection.js   # Role assignment & self-demotion guards
│
├── pages/                         # Page Object Model (POM) representations
│   ├── BasePage.js               # Common base page with navigation helpers
│   ├── LoginPage.js              # /login page object
│   ├── SignupPage.js             # /signup page object
│   ├── DashboardPage.js          # /dashboard base router & role badge verifier
│   ├── HomePage.js               # Home overview metrics cards & quick links
│   ├── OrganizationsPage.js      # Organizations cards grid, search, add & edit modal
│   ├── BuildingsPage.js          # Buildings grid, top-right org filter & edit view
│   ├── AdminDashboardPage.js     # Admin full workspace view
│   ├── PlusDashboardPage.js      # Plus view-only workspace view
│   └── ProDashboardPage.js       # Pro edit-enabled workspace view
│
├── fixtures/                      # Playwright custom fixtures
│   ├── base.fixture.js           # Extended test runner providing all page objects & components
│   └── auth.fixture.js           # Pre-authenticated context fixtures
│
├── test-data/                     # Deterministic test data & user profiles
│   ├── users.json                # Fixed test accounts: admin, plus, pro
│   └── invalid-data.json         # Boundary & negative test payloads
│
├── tests/                         # Playwright E2E Test Suites (12 Spec Files, 48 Tests)
│   ├── home.spec.js              # TC-HOME: Overview metrics, quick links, system status
│   ├── organizations.spec.js     # TC-ORG: Grid, search, add org, edit specialization, delete
│   ├── buildings.spec.js         # TC-BLDG: Grid, org dropdown filter, add from org, edit, delete
│   ├── rbac.spec.js              # TC-RBAC: Plus (view-only), Pro (edit only), Admin (full CRUD)
│   ├── login.spec.js             # TC-LOGIN: Login authentication & form validation
│   ├── signup.spec.js            # TC-SIGNUP: Registration flow & password length checks
│   ├── logout.spec.js            # TC-LOGOUT: Session termination & route protection
│   ├── role-views.spec.js        # TC-VIEWS: Role badges in navbar & feature cards isolation
│   ├── add-user.spec.js          # TC-ADD: Admin user creation modal & validation
│   ├── manage-users.spec.js      # TC-MANAGE: User list, status updates, self-delete guard
│   ├── role-management.spec.js   # TC-ROLE: Role promotion/demotion & self-demotion guard
│   └── user-lifecycle.spec.js    # TC-LIFE: Complete lifecycle (signup -> plus -> pro -> delete)
│
├── reporters/                     # Custom Reporters
│   └── excel-reporter.js         # Generates styled XML spreadsheet (.xls) with KPI summary
│
├── reports/                       # Consolidated Reports Directory
│   ├── html-report/              # Interactive Playwright HTML report
│   ├── Test_Report.xls           # Formatted Excel test execution report
│   └── archive/                  # Historical timestamped run archives
│
├── MANUAL_TEST_CASES.html         # Formatted HTML Manual Test Cases (48 Test Cases)
├── MANUAL_TEST_CASES_STEP_BY_STEP_FORMATTED 1.xlsx # Excel Manual Test Cases (48 Test Cases)
├── playwright.config.js           # Playwright runner configuration (ESM, single worker, reports)
└── package.json                   # Project scripts and Playwright dependencies
```

---

## 👥 Fixed Test Users (`test-data/users.json`)

All tests execute against pre-configured credentials without randomizing accounts:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Password123!` | Full CRUD on Organizations, Buildings, Users tab, Role Management |
| **Pro** | `pro@example.com` | `Password123!` | Edit Organizations & Buildings, Add Building in Edit Org, Cannot Delete, No Users Tab |
| **Plus** | `plus@example.com` | `Password123!` | View-Only on Organizations & Buildings, Cannot Edit/Add/Delete, No Users Tab |

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Feature / Action | Admin | Pro | Plus |
| :--- | :---: | :---: | :---: |
| **Navbar Brand & Tier Badge** | ✅ `Admin Dashboard` | ✅ `Pro Dashboard` | ✅ `Plus Dashboard` |
| **Home Overview Metrics** | ✅ Full metrics | ✅ Full metrics | ✅ Full metrics |
| **View Organizations Grid** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Create Organization** | ✅ Yes | ❌ Hidden | ❌ Hidden |
| **Edit Organization & Specialization** | ✅ Yes | ✅ Yes | ❌ Disabled (Read-only) |
| **Add Building (in Edit Org)** | ✅ Yes | ✅ Yes | ❌ Hidden |
| **Delete Organization** | ✅ Yes | ❌ Hidden | ❌ Hidden |
| **View Buildings Grid & Filter** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Edit Building Floors** | ✅ Yes | ✅ Yes | ❌ Disabled (Read-only) |
| **Delete Building** | ✅ Yes | ❌ Hidden | ❌ Hidden |
| **Users Tab (Add, Manage, Role)** | ✅ Full Access | ❌ Inaccessible | ❌ Inaccessible |

---

## 🚀 Running Automated Tests

### 1. Ensure the Web Application is Running
In a separate terminal, start the application from `M-demo`:
```bash
cd M-demo
npm run dev
```
*(Default URL: `http://localhost:5173`)*

### 2. Execute Tests from `qa-automation`
In the `qa-automation` directory:

```bash
# Run all 48 test cases across all suites
npm test

# Run tests in UI mode (Interactive Playwright Test Runner with time-travel)
npm run test:ui

# Run tests with visible browser window (headed mode)
npm run test:headed

# Run specific feature suites
npm run test:auth          # Login, Signup, Logout
npm run test:admin         # Add User, Manage Users, Role Management
npm run test:dashboard     # Role Views Suite

# Run new modules directly
npx playwright test tests/home.spec.js
npx playwright test tests/organizations.spec.js
npx playwright test tests/buildings.spec.js
npx playwright test tests/rbac.spec.js
```

---

## 📊 Viewing Test Reports

All reports are consolidated into the existing `reports/` folder:

```bash
# View interactive HTML report
npm run test:report

# Open styled native Excel report (.xls) on Windows
npm run test:report:excel
```

- **Interactive HTML Report**: Detailed step timings, trace files, snapshots, and failure video recordings stored in `reports/html-report/`.
- **Excel Report (`reports/Test_Report.xls`)**: KPI scorecard with total tests, passed, failed, duration, and color-coded execution status.
- **Manual Test Specification**: Synchronized in both [MANUAL_TEST_CASES.html](file:///c:/Users/satish.patil2/Mdemo/qa-automation/MANUAL_TEST_CASES.html) and [MANUAL_TEST_CASES_STEP_BY_STEP_FORMATTED 1.xlsx](file:///c:/Users/satish.patil2/Mdemo/qa-automation/MANUAL_TEST_CASES_STEP_BY_STEP_FORMATTED%201.xlsx).
