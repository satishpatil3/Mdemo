import { useNavigate, useSearchParams } from "react-router-dom";
import { logout } from "../services/authService";

/**
 * Global Navigation Bar Component
 * Displays application logo, role-aware navigation tabs, and user session actions.
 * - Admin sees: Home, Organizations, Buildings, Users
 * - Plus & Pro see: Home, Organizations, Buildings
 */
const NAV_TABS = [
  { id: "home", label: "home" },
  { id: "organizations", label: "organizations" },
  { id: "buildings", label: "buildings" },
  { id: "users", label: "users", adminOnly: true }
];

function Navbar({ role = "admin" }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active navigation tab from URL query params (defaults to "home")
  const activeTab = searchParams.get("tab") || "home";

  const normRole = (role || "plus").trim().toLowerCase();

  // Filter visible tabs based on user access role (Plus and Pro see Home, Organizations, Buildings)
  const visibleTabs = NAV_TABS.filter((tab) => {
    if (tab.adminOnly) {
      return normRole === "admin";
    }
    return true;
  });

  // Handle user logout and redirect to landing page
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Switch navigation tabs via search params
  const handleTabClick = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Format dashboard label based on user access tier
  const getDashboardLabel = () => {
    if (normRole === "admin") return "Admin Dashboard";
    if (normRole === "pro") return "Pro Dashboard";
    return "Plus Dashboard";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-8 py-3.5 flex items-center justify-between shadow-md">
      {/* Left Column: Brand logo */}
      <div className="flex-1 flex justify-start items-center">
        <h1 className="text-2xl font-bold text-green-400 tracking-tight select-none">
          FirebaseApp
        </h1>
      </div>

      {/* Center Column: Role-Aware Navigation Tabs */}
      <div className="flex items-center justify-center gap-8">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`text-sm font-semibold transition-all duration-150 cursor-pointer pb-1 border-b-2 ${
                isActive
                  ? "text-white font-bold border-white"
                  : "text-slate-300 hover:text-white border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Column: Dashboard link & Logout button */}
      <div className="flex-1 flex justify-end items-center gap-6">
        <button
          type="button"
          onClick={() => handleTabClick("home")}
          className="text-white hover:text-green-400 font-semibold text-sm transition-colors cursor-pointer"
        >
          {getDashboardLabel()}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-xl text-white font-semibold text-sm hover:bg-red-600 transition shadow-xs cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
