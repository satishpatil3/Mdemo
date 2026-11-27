import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AddUserForm from "../components/AddUserForm";
import FeatureCard from "../components/FeatureCard";
import ManageUsers from "../components/ManageUsers";
import RoleManagement from "../components/RoleManagement";
import OrganizationCard from "../components/OrganizationCard";
import AddOrganizationModal from "../components/AddOrganizationModal";
import EditOrganization from "../components/EditOrganization";
import EditBuilding from "../components/EditBuilding";
import BuildingDetailsModal from "../components/BuildingDetailsModal";
import {
  getAllOrganizations,
  deleteOrganization
} from "../services/organizationService";
import {
  getAllBuildings
} from "../services/buildingService";
import {
  checkAndSyncSampleData
} from "../services/sampleDataService";
import { getAllUsers } from "../services/userService";
import { toast } from "../context/ToastContext";

/**
 * AdminDashboard Component
 * Core workspace container supporting role-based access tiers:
 * - Admin: Full capabilities (Home, Organizations, Buildings, Users management, Add/Edit/Delete)
 * - Pro: Edit access (Home, Organizations, Buildings; can edit/save details; delete is disabled)
 * - Plus: View-only access (Home, Organizations, Buildings; read-only forms; delete and add disabled)
 *
 * @param {Object} props
 * @param {'admin'|'pro'|'plus'} [props.role='admin'] - Current user authorization tier
 */
function AdminDashboard({ role = "plus" }) {
  const normRole = (role || "plus").trim().toLowerCase();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation tabs synced with URL: "home" | "organizations" | "buildings" | "users"
  // Safe role guard: if non-admin attempts to access "users" tab, smoothly fallback to "home" without side-effects
  const rawTab = searchParams.get("tab") || "home";
  const activeTab = rawTab === "users" && normRole !== "admin" ? "home" : rawTab;

  const orgIdParam = searchParams.get("org") || "";
  const buildingIdParam = searchParams.get("building") || "";
  const orgFilterParam = searchParams.get("orgFilter") || searchParams.get("buildingOrg") || "";

  // Organizations State
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddOrg, setShowAddOrg] = useState(false);

  // Buildings State
  const [allBuildings, setAllBuildings] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [selectedBuildingForModal, setSelectedBuildingForModal] = useState(null);
  const selectedOrgFilter = orgFilterParam;

  // Users State (under the "users" tab and for Home overview metrics)
  const [userCount, setUserCount] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [activeUserView, setActiveUserView] = useState(""); // "" | "manageUsers" | "roleManagement"

  // Fetch organizations from Firestore
  const loadOrgs = useCallback(async () => {
    try {
      setLoadingOrgs(true);
      const data = await getAllOrganizations();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading organizations:", error);
      toast.error("Failed to load organizations from database");
    } finally {
      setLoadingOrgs(false);
    }
  }, []);

  // Fetch buildings from Firestore
  const loadBuildings = useCallback(async () => {
    try {
      setLoadingBuildings(true);
      const data = await getAllBuildings();
      setAllBuildings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading buildings:", error);
    } finally {
      setLoadingBuildings(false);
    }
  }, []);

  // Ensure buildings are freshly reloaded whenever entering buildings tab
  useEffect(() => {
    if (activeTab !== "buildings") return;
    let isMounted = true;

    getAllBuildings()
      .then((data) => {
        if (isMounted) {
          setAllBuildings(Array.isArray(data) ? data : []);
          setLoadingBuildings(false);
        }
      })
      .catch((error) => {
        console.error("Error loading buildings:", error);
        if (isMounted) setLoadingBuildings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Initial data loading on mount
  useEffect(() => {
    let isMounted = true;

    const loadFallbackData = async () => {
      try {
        const [orgsData, buildingsData] = await Promise.all([
          getAllOrganizations(),
          getAllBuildings()
        ]);
        if (isMounted) {
          setOrganizations(Array.isArray(orgsData) ? orgsData : []);
          setAllBuildings(Array.isArray(buildingsData) ? buildingsData : []);
        }
      } catch (err) {
        console.error("Error loading initial organizations/buildings:", err);
      } finally {
        if (isMounted) {
          setLoadingOrgs(false);
          setLoadingBuildings(false);
        }
      }
    };

    const initData = async () => {
      try {
        const syncResult = await checkAndSyncSampleData();
        if (!isMounted) return;

        if (syncResult?.synced) {
          setOrganizations(Array.isArray(syncResult.organizations) ? syncResult.organizations : []);
          setAllBuildings(Array.isArray(syncResult.buildings) ? syncResult.buildings : []);
          setLoadingOrgs(false);
          setLoadingBuildings(false);
          toast.success("Loaded 4 Indian organizations & 4 buildings");
        } else {
          await loadFallbackData();
        }
      } catch (err) {
        console.error("Error checking or syncing sample data:", err);
        if (isMounted) {
          await loadFallbackData();
        }
      }

      try {
        const users = await getAllUsers();
        if (isMounted) {
          setUserCount(Array.isArray(users) ? users.length : 0);
        }
      } catch (err) {
        console.error("Error loading user count:", err);
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Selected organization derived from URL parameter
  const selectedOrg = useMemo(() => {
    if (!orgIdParam) return null;
    return (organizations || []).find((o) => o?.id === orgIdParam) || null;
  }, [orgIdParam, organizations]);

  // Selected building derived from URL parameter (enables browser back button to return to all building cards)
  const editingBuilding = useMemo(() => {
    if (!buildingIdParam) return null;
    return (allBuildings || []).find((b) => b?.id === buildingIdParam) || null;
  }, [buildingIdParam, allBuildings]);

  // Tab switch handler
  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  // Select building (pushes ?tab=buildings&building=... so browser back returns to all building cards)
  const handleSelectBuilding = (building) => {
    if (building?.id) {
      setSearchParams({ tab: "buildings", building: building.id });
    }
  };

  // Back to buildings card list (preserves org filter if set)
  const handleBackToBuildings = () => {
    if (selectedOrgFilter) {
      setSearchParams({ tab: "buildings", orgFilter: selectedOrgFilter });
    } else {
      setSearchParams({ tab: "buildings" });
    }
  };

  // Select organization (pushes ?org=... so browser back brings user back to cards)
  const handleSelectOrg = (org) => {
    if (org?.id) {
      setSearchParams({ tab: "organizations", org: org.id });
    }
  };

  // Back to organizations card list
  const handleBackToOrgs = () => {
    setSearchParams({ tab: "organizations" });
  };

  // Filter organizations by search query (defensively guarded against undefined properties)
  const filteredOrganizations = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return organizations || [];
    return (organizations || []).filter(
      (org) =>
        (org?.name && typeof org.name === "string" && org.name.toLowerCase().includes(q)) ||
        (org?.country && typeof org.country === "string" && org.country.toLowerCase().includes(q)) ||
        (org?.category && typeof org.category === "string" && org.category.toLowerCase().includes(q))
    );
  }, [organizations, searchQuery]);

  // Filter buildings strictly based on organization (robust matching by orgId and orgName)
  const displayedBuildings = useMemo(() => {
    const rawFilter = (selectedOrgFilter || "").trim();
    if (!rawFilter || rawFilter.toLowerCase() === "all" || rawFilter.toLowerCase() === "all organizations") {
      return allBuildings || [];
    }

    const filterLower = rawFilter.toLowerCase();

    // Find the organization from organizations list that matches either by id or name
    const matchedOrg = (organizations || []).find(
      (o) =>
        o &&
        (o.id === rawFilter ||
          (o.name && typeof o.name === "string" && o.name.trim().toLowerCase() === filterLower))
    );

    const targetOrgId = matchedOrg ? matchedOrg.id : "";
    const targetOrgName = matchedOrg && matchedOrg.name ? matchedOrg.name.trim().toLowerCase() : filterLower;

    return (allBuildings || []).filter((b) => {
      if (!b) return false;
      const bOrgId = (b.orgId || "").trim();
      const bOrgName = (b.orgName || "").trim().toLowerCase();

      // 1. Match by orgId
      if (targetOrgId && bOrgId && bOrgId === targetOrgId) {
        return true;
      }
      if (bOrgId && bOrgId === rawFilter) {
        return true;
      }

      // 2. Match by orgName
      if (targetOrgName && bOrgName && bOrgName === targetOrgName) {
        return true;
      }
      if (bOrgName && bOrgName === filterLower) {
        return true;
      }

      return false;
    });
  }, [allBuildings, selectedOrgFilter, organizations]);

  // Handle organization deletion from Edit view
  const handleDeleteFromEdit = async (id, name) => {
    try {
      await deleteOrganization(id);
      toast.success(`Organization "${name}" deleted`);
      handleBackToOrgs();
      loadOrgs();
    } catch (error) {
      toast.error("Error deleting organization: " + (error?.message || String(error)));
    }
  };

  // Handle organization saved from Edit view: redirect back to cards view
  const handleOrgSaved = (updatedOrg) => {
    if (updatedOrg?.id) {
      setOrganizations((prev) =>
        (prev || []).map((o) => (o.id === updatedOrg.id ? { ...o, ...updatedOrg } : o))
      );
    }
    handleBackToOrgs();
    loadOrgs();
  };

  // When clicking on a specific building from EditOrganization, open in Buildings tab
  const handleViewBuildingInTab = (building, organization) => {
    const targetName = organization?.name || building?.orgName || "";
    setSearchParams({
      tab: "buildings",
      ...(targetName ? { orgFilter: targetName } : {})
    });
  };

  // Called when a new building is added from inside Edit Organization
  const handleBuildingAdded = async (newBuilding, org) => {
    const targetOrgName = org?.name || newBuilding?.orgName || "";

    // 1. Immediately inject the new building into state so it displays with ZERO delay
    if (newBuilding) {
      setAllBuildings((prev) => {
        const filtered = (prev || []).filter((b) => b.id !== newBuilding.id);
        return [newBuilding, ...filtered];
      });
    }

    // 2. Also trigger a background fetch to ensure fresh Firestore data
    loadBuildings();

    // 3. Redirect immediately to the buildings tab with the filter param
    setSearchParams({
      tab: "buildings",
      ...(targetOrgName ? { orgFilter: targetOrgName } : {})
    });
  };

  // User Section Feature Cards
  const userFeatures = [
    {
      title: "Add User",
      description: "Create a new user and pre-assign an access role",
      onClick: () => setShowAddUser(true)
    },
    {
      title: "Manage Users",
      description: "View all users, inspect status badges, and delete accounts",
      onClick: () => setActiveUserView("manageUsers")
    },
    {
      title: "Role Management",
      description: "Promote and demote users between Plus, Pro, and Admin",
      onClick: () => setActiveUserView("roleManagement")
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* ============================================================== */}
      {/* TAB 1: ORGANIZATIONS                                           */}
      {/* ============================================================== */}
      {activeTab === "organizations" && (
        <section className="animate-in fade-in duration-200">
          {/* If an organization is selected via URL, show EditOrganization screen */}
          {selectedOrg ? (
            <EditOrganization
              organization={selectedOrg}
              role={normRole}
              onBack={handleBackToOrgs}
              onSave={handleOrgSaved}
              onDelete={handleDeleteFromEdit}
              onSelectBuilding={handleSelectBuilding}
              onViewBuildingInTab={handleViewBuildingInTab}
              onBuildingAdded={handleBuildingAdded}
            />
          ) : (
            <>
              {/* Top Controls: Search Input + Add Organization Button (Admin only) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mb-8">
                {/* Search Input with Search Icon */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* + Add Organization Button (Admin only) */}
                {normRole === "admin" && (
                  <button
                    type="button"
                    onClick={() => setShowAddOrg(true)}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-5 py-2.5 rounded-xl border border-slate-300 shadow-sm hover:shadow transition text-sm shrink-0 cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>add organization</span>
                  </button>
                )}
              </div>

              {/* Grid of Organization Cards */}
              {loadingOrgs ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mb-3"></div>
                  <p className="text-sm font-medium">Loading organizations from database...</p>
                </div>
              ) : (filteredOrganizations || []).length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">No organizations found</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    {searchQuery
                      ? `No organization matched "${searchQuery}".`
                      : "No organizations exist in the database yet."}
                  </p>
                  {normRole === "admin" && (
                    <button
                      type="button"
                      onClick={() => setShowAddOrg(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow cursor-pointer"
                    >
                      + Add First Organization
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {(filteredOrganizations || []).map((org) => (
                    <OrganizationCard
                      key={org?.id || org?.name}
                      organization={org}
                      onSelect={() => handleSelectOrg(org)}
                    />
                  ))}
                </div>
              )}

              {/* Add Organization Modal Popup */}
              {showAddOrg && (
                <AddOrganizationModal
                  onClose={() => setShowAddOrg(false)}
                  onSuccess={loadOrgs}
                />
              )}
            </>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 2: USERS (Add User, Manage Users, Role Management)        */}
      {/* ============================================================== */}
      {activeTab === "users" && normRole === "admin" && (
        <section className="animate-in fade-in duration-200">
          {/* Manage Users Functional View */}
          {activeUserView === "manageUsers" && (
            <div className="mb-8">
              <ManageUsers onClose={() => setActiveUserView("")} />
            </div>
          )}

          {/* Role Management Functional View */}
          {activeUserView === "roleManagement" && (
            <div className="mb-8">
              <RoleManagement onClose={() => setActiveUserView("")} />
            </div>
          )}

          {/* Feature Cards Grid for User Operations */}
          <div className="grid md:grid-cols-3 gap-6">
            {userFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                onClick={feature.onClick}
              />
            ))}
          </div>

          {/* Add User Popup Modal */}
          {showAddUser && (
            <AddUserForm onClose={() => setShowAddUser(false)} />
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 3: HOME                                                    */}
      {/* ============================================================== */}
      {activeTab === "home" && (
        <section className="animate-in fade-in duration-200 space-y-8">
          {/* 3 Metric Overview Cards (Same height as building cards: min-h-[210px]) */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* 1. Total Organizations Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleTabChange("organizations")}
              className="bg-white rounded-2xl border border-slate-300 p-6 min-h-[210px] shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 cursor-pointer flex flex-col justify-between group select-none"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                      Total Organizations
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      Registered corporate entities
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {loadingOrgs ? "..." : (organizations || []).length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-2">
                    {(organizations || []).length === 1 ? "Organization" : "Organizations"}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between text-xs">
                <span className="font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center">
                  Organizations
                </span>
                <span className="font-medium text-slate-400 group-hover:text-blue-600 transition flex items-center gap-1">
                  View all
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 2. Total Buildings Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleTabChange("buildings")}
              className="bg-white rounded-2xl border border-slate-300 p-6 min-h-[210px] shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 cursor-pointer flex flex-col justify-between group select-none"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                      Total Buildings
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      Facilities & campus real estate
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {loadingBuildings ? "..." : (allBuildings || []).length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-2">
                    {(allBuildings || []).length === 1 ? "Building" : "Buildings"}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between text-xs">
                <span className="font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center">
                  Infrastructure
                </span>
                <span className="font-medium text-slate-400 group-hover:text-blue-600 transition flex items-center gap-1">
                  View all
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 3. Total Users Card (Interactive for admin, read-only metric for others) */}
            <div
              role={normRole === "admin" ? "button" : undefined}
              tabIndex={normRole === "admin" ? 0 : undefined}
              onClick={normRole === "admin" ? () => handleTabChange("users") : undefined}
              className={`bg-white rounded-2xl border border-slate-300 p-6 min-h-[210px] shadow-xs ${
                normRole === "admin" ? "hover:shadow-md hover:border-slate-400 cursor-pointer" : "cursor-default"
              } transition-all duration-200 flex flex-col justify-between group select-none`}
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                      Total Users
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      Active accounts & role access
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {loadingUsers ? "..." : userCount}
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-2">
                    {userCount === 1 ? "User" : "Users"}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between text-xs">
                <span className="font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center">
                  Accounts
                </span>
                {normRole === "admin" ? (
                  <span className="font-medium text-slate-400 group-hover:text-blue-600 transition flex items-center gap-1">
                    Manage
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">
                    Admin only
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 4: BUILDINGS (Infrastructure Management)                   */}
      {/* ============================================================== */}
      {activeTab === "buildings" && (
        <section className="animate-in fade-in duration-200">
          {editingBuilding ? (
            <EditBuilding
              building={editingBuilding}
              role={normRole}
              backLabel="Back to Buildings"
              onBack={handleBackToBuildings}
              onSave={() => {
                handleBackToBuildings();
                loadBuildings();
              }}
              onDelete={() => {
                handleBackToBuildings();
                loadBuildings();
              }}
            />
          ) : (
            <>
              {/* Organization Filter Dropdown (right-aligned) */}
              <div className="flex justify-end mb-6">
                <div className="relative">
                  <select
                    value={
                      (organizations || []).find(
                        (o) =>
                          o &&
                          (o.id === selectedOrgFilter ||
                            (o.name && typeof o.name === "string" && o.name.trim().toLowerCase() === (selectedOrgFilter || "").trim().toLowerCase()))
                      )?.name || selectedOrgFilter || ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setSearchParams({ tab: "buildings", orgFilter: val });
                      } else {
                        setSearchParams({ tab: "buildings" });
                      }
                    }}
                    className="w-full sm:w-auto bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
                  >
                    <option value="">All Organizations</option>
                    {(organizations || []).map((org) => (
                      <option key={org?.id || org?.name} value={org?.name || ""}>
                        {org?.name || "Unnamed Organization"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingBuildings ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mb-3"></div>
                  <p className="text-sm font-medium">Loading buildings from database...</p>
                </div>
              ) : (displayedBuildings || []).length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">No buildings found</h3>
                  <p className="text-sm text-slate-500 mb-2">
                    {selectedOrgFilter
                      ? `No buildings registered for "${selectedOrgFilter}".`
                      : "No buildings exist in the database yet."}
                  </p>
                  {selectedOrgFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams({ tab: "buildings" });
                      }}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                    >
                      Show all buildings
                    </button>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    (Note: Buildings are added directly from the Organization edit section)
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {(displayedBuildings || []).map((b) => (
                    <div
                      key={b?.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectBuilding(b)}
                      className="bg-white rounded-2xl border border-slate-300 p-6 min-h-[210px] shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 cursor-pointer flex flex-col justify-between group select-none"
                    >
                      {/* Building Top Section: Icon + Name */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                          <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate" title={b?.name || "Unnamed Building"}>
                            {b?.name || "Unnamed Building"}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {b?.orgName || ""}
                          </p>
                        </div>
                      </div>

                      {/* Building Bottom Section: Country badge & clickable details cue */}
                      <div className="mt-auto pt-6 flex items-center justify-between">
                        {b?.country ? (
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center">
                            {b.country}
                          </span>
                        ) : (
                          <span></span>
                        )}
                        <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600 transition flex items-center gap-1">
                          Details
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Building Details Information Modal */}
              {selectedBuildingForModal && (
                <BuildingDetailsModal
                  building={selectedBuildingForModal}
                  onClose={() => setSelectedBuildingForModal(null)}
                />
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminDashboard;
