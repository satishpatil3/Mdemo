# M-Demo Web Application

A full-stack modern React application built with **Vite**, **Tailwind CSS**, and **Firebase** (Authentication & Firestore), featuring **Role-Based Access Control (RBAC)**, real-time toast notifications, and strict administrative guardrails.

---

## 📁 Architecture & Folder Structure

```
M-demo/
│
├── public/                            # Static public assets
│   └── vite.svg
│
├── src/
│   ├── components/                    # Reusable UI components & modals
│   │   ├── AddUserForm.jsx            # Modal popup to pre-add a user with a role
│   │   ├── FeatureCard.jsx            # Dashboard feature card UI
│   │   ├── ManageUsers.jsx            # Admin table: view users, statuses, and delete
│   │   ├── Navbar.jsx                 # Global header with branding & logout button
│   │   └── RoleManagement.jsx         # Admin panel to edit/reassign user roles
│   │
│   ├── context/                       # Global React Context providers
│   │   ├── AuthContext.jsx            # Firebase Auth state listener (currentUser, loading)
│   │   ├── auth-context.js            # Base context definition
│   │   └── ToastContext.jsx           # Global toast alert notification system
│   │
│   ├── data/                          # Static configuration data
│   │   └── permissions.js             # Role-based feature permissions (admin, plus, pro)
│   │
│   ├── firebase/                      # Firebase configuration & initialization
│   │   └── firebase.js                # Firebase App, Auth (`auth`), and Firestore (`db`)
│   │
│   ├── hooks/                         # Custom React Hooks
│   │   └── useAuth.js                 # Easy consumer hook for AuthContext
│   │
│   ├── pages/                         # Application routes & screens
│   │   ├── Home.jsx                   # Public landing page
│   │   ├── Login.jsx                  # User login page with validation & error toasts
│   │   ├── Signup.jsx                 # User registration with pre-role resolution
│   │   ├── Dashboard.jsx              # Base dashboard router (routes to role view)
│   │   ├── AdminDashboard.jsx         # Administrative dashboard & management tools
│   │   ├── PlusDashboard.jsx          # Plus tier user dashboard
│   │   └── ProDashboard.jsx           # Pro tier user dashboard
│   │
│   ├── routes/                        # Route guards & routing configuration
│   │   └── ProtectedRoute.jsx         # Redirects unauthenticated visitors to /login
│   │
│   ├── services/                      # Backend & API communication layer
│   │   ├── authService.js             # Firebase Auth wrapper (signup, login, logout)
│   │   └── userService.js             # Firestore operations (CRUD, query, deduplication)
│   │
│   ├── App.jsx                        # Main router setup & context provider wrapping
│   ├── main.jsx                       # Application entry point (DOM mount)
│   └── index.css                      # Global styles & Tailwind CSS directives
│
├── .gitignore                         # Git ignored files & directories
├── index.html                         # Single-page HTML root template
├── package.json                       # Scripts and project dependencies
├── postcss.config.js                  # PostCSS configuration for Tailwind CSS
├── tailwind.config.js                 # Tailwind CSS styling configuration
├── vite.config.js                     # Vite build tool configuration
└── README.md                          # Project documentation
```

---

## 👥 Role-Based Access Control (RBAC)

The application provides three distinct access tiers defined in `src/data/permissions.js`:

| Role | Access Level | Available Features |
| :--- | :--- | :--- |
| **Admin** | Full Administrative Access | Add User, Manage Users, Role Management, Analytics, Reports, Settings |
| **Plus** | Standard Tier User | View Projects, Create Project, Basic Reports |
| **Pro** | Premium Tier User | View Projects, Create Project, Advanced Analytics, Export Reports, Priority Support |

---

## 🛡️ Key Business Rules & Guardrails

1. **Admin Self-Deletion Guard:**
   * An active Admin cannot delete their own account from the *Manage Users* table.
   * Marked with a `You (Active Admin)` badge with the delete button disabled.

2. **Admin Self-Demotion Guard:**
   * An active Admin cannot change their own access level in *Role Management*.
   * Marked with a `You (Self)` badge to prevent an Admin from accidentally locking themselves out of the system.

3. **Signup Pending Flow:**
   * When an Admin pre-adds a user via *Add User*, the account is created with `status: "pending_signup"`.
   * Only after the user visits the Signup page and creates their password does their account become `status: "signed_up"`.
   * Unregistered users cannot have their roles changed until they complete registration.

4. **Floating Toast System:**
   * Replaced raw browser alert popups with modern, non-blocking floating notifications in `ToastContext.jsx`.
   * Supports `toast.success()`, `toast.error()`, `toast.warning()`, and `toast.info()`.

---

## 🚀 Getting Started (Development Guide)

### 1. Prerequisites
* **Node.js** v18+ installed
* **npm** or **yarn** package manager

### 2. Install Dependencies
```bash
# In the M-demo directory:
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
The app will be live at: **`http://localhost:5173`** (with Hot Module Replacement).

### 4. Build for Production
```bash
npm run build
```
Generates production-ready, minified static assets in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🧪 Automated Testing

End-to-End (E2E) testing for this application is built with **Playwright** and lives in the sibling directory:
```
../qa-automation/
```
To run the automated test suite against this app:
```bash
cd ../qa-automation
npm run test
```
*(See `../qa-automation/README.md` for full test details).*
