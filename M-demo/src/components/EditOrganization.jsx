import { useState, useEffect } from "react";
import { updateOrganization } from "../services/organizationService";
import { getBuildingsByOrg } from "../services/buildingService";
import AddBuildingModal from "./AddBuildingModal";
import BuildingDetailsModal from "./BuildingDetailsModal";
import EditBuilding from "./EditBuilding";
import { toast } from "../context/ToastContext";

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
  "Australia",
  "Japan",
  "Singapore",
  "France",
  "Netherlands",
  "United Arab Emirates",
  "Sweden"
];

// All 28 States and 8 Union Territories of India
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

/**
 * EditOrganization Component
 * Comprehensive organization editing screen with role-based permissions:
 * - Admin: Full access (Can edit all fields, save, delete, and add buildings)
 * - Pro: Edit access (Can edit all fields and save; cannot delete or add buildings)
 * - Plus: View-only access (All fields disabled; save, delete, and add buildings hidden)
 *
 * @param {Object} props
 * @param {Object} props.organization - The organization being edited
 * @param {'admin'|'pro'|'plus'} [props.role='admin'] - Current user authorization tier
 * @param {Function} props.onBack - Return to organization list
 * @param {Function} props.onSave - Save organization callback
 * @param {Function} props.onDelete - Delete organization callback
 * @param {Function} props.onSelectBuilding - Building selection callback
 * @param {Function} props.onViewBuildingInTab - View building in tab callback
 * @param {Function} props.onBuildingAdded - Callback when building is added
 */
function EditOrganization({
  organization,
  role = "plus",
  onBack,
  onSave,
  onDelete,
  onSelectBuilding,
  onViewBuildingInTab,
  onBuildingAdded
}) {
  const normRole = (role || "plus").trim().toLowerCase();
  // Role-based permissions:
  // - Plus: view-only (read-only forms; save, delete, add buildings hidden)
  // - Pro: can edit org details and add buildings (cannot delete)
  // - Admin: full access (can edit, delete, and add buildings)
  const isReadOnly = normRole === "plus";
  const canDelete = normRole === "admin";
  const canAddBuilding = normRole === "admin" || normRole === "pro";

  // Form state initialized from selected organization
  const [name, setName] = useState(organization?.name || "");
  const [category, setCategory] = useState(organization?.category || "Corporate");
  const [streetAddress, setStreetAddress] = useState(organization?.streetAddress || "");
  const [addressLine2, setAddressLine2] = useState(organization?.addressLine2 || "");
  const [city, setCity] = useState(organization?.city || "");
  const [country, setCountry] = useState(organization?.country || "India");

  // Only Indian states (defaults to Maharashtra if not previously set or not in Indian states list)
  const [state, setState] = useState(
    organization?.state && INDIAN_STATES.includes(organization.state)
      ? organization.state
      : "Maharashtra"
  );

  // Contact details state (from Image 2)
  const [contactName, setContactName] = useState(organization?.contactName || "");
  const [contactEmail, setContactEmail] = useState(organization?.contactEmail || "");

  // Phone number limited to 10 digits
  const [phone, setPhone] = useState(
    (organization?.phone || "").replace(/\D/g, "").slice(0, 10)
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Buildings for this organization
  const [buildings, setBuildings] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [selectedBuildingDetails, setSelectedBuildingDetails] = useState(null);
  const [editingBuilding, setEditingBuilding] = useState(null);

  // Fetch buildings for this organization from Firestore
  const loadOrgBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const data = await getBuildingsByOrg(organization?.id, organization?.name);
      setBuildings(data);
    } catch (err) {
      console.error("Error loading buildings:", err);
    } finally {
      setLoadingBuildings(false);
    }
  };

  // Called when a building is successfully created from the modal
  const handleBuildingCreated = async (createdBuilding) => {
    setShowAddBuilding(false);
    await loadOrgBuildings();
    if (onBuildingAdded) {
      onBuildingAdded(createdBuilding, organization);
    }
  };

  useEffect(() => {
    if (organization) {
      setName(organization.name || "");
      setCategory(organization.category || "Corporate");
      setStreetAddress(organization.streetAddress || "");
      setAddressLine2(organization.addressLine2 || "");
      setCity(organization.city || "");
      setCountry(organization.country || "India");
      setState(
        organization.state && INDIAN_STATES.includes(organization.state)
          ? organization.state
          : "Maharashtra"
      );
      setContactName(organization.contactName || "");
      setContactEmail(organization.contactEmail || "");
      setPhone((organization.phone || "").replace(/\D/g, "").slice(0, 10));
      loadOrgBuildings();
    }
  }, [organization?.id, organization?.name]);

  // Restrict phone input to numeric and max 10 digits
  const handlePhoneChange = (e) => {
    const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(numericOnly);
  };

  // Handle Save (Allowed for Admin and Pro; blocked for Plus)
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (isReadOnly) {
      toast.warning("View only mode: you cannot edit organization details");
      return;
    }

    if (!name.trim()) {
      toast.warning("Organization name cannot be empty");
      return;
    }

    // Email validation
    if (contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail.trim())) {
        toast.warning("Please enter a valid email address (e.g., name@company.com)");
        return;
      }
    }

    // 10-digit Phone validation
    if (phone.trim() && phone.trim().length !== 10) {
      toast.warning("Phone number must be exactly 10 digits");
      return;
    }

    try {
      setSaving(true);
      const updatedData = {
        name: name.trim(),
        category: category.trim() || "Corporate",
        streetAddress: streetAddress.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        phone: phone.trim()
      };

      await updateOrganization(organization.id, updatedData);
      toast.success(`Organization "${name.trim()}" updated successfully!`);
      if (onSave) onSave({ ...organization, ...updatedData });
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.error(error.message || "Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete (Admin only; blocked for Pro and Plus)
  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("Permission denied: only Admins can delete organizations");
      return;
    }

    try {
      setDeleting(true);
      if (onDelete) {
        await onDelete(organization.id, organization.name);
      }
    } catch (error) {
      toast.error("Failed to delete organization: " + error.message);
    } finally {
      setDeleting(false);
    }
  };

  // If editing a building, render EditBuilding view
  if (editingBuilding) {
    return (
      <EditBuilding
        building={editingBuilding}
        organization={organization}
        role={role}
        backLabel="Back to Organization"
        onBack={() => setEditingBuilding(null)}
        onSave={() => {
          setEditingBuilding(null);
          loadOrgBuildings();
        }}
        onDelete={() => {
          setEditingBuilding(null);
          loadOrgBuildings();
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-in fade-in duration-200">
      {/* Top Back Navigation Link */}
      <div className="mb-6">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (onBack) onBack();
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition group cursor-pointer"
        >
          <svg
            className="w-4 h-4 transition group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Organizations</span>
        </button>
      </div>

      {/* Main Title & Role View Badge */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isReadOnly ? "Organization Details" : "Edit Organization"}
        </h2>
        {isReadOnly && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            View Only
          </span>
        )}
      </div>

      {/* Top Left Section: Card Preview Thumbnail & Delete Organization Button */}
      <div className="mb-8">
        {/* Preview Card Thumbnail */}
        <div className="w-80 bg-[#eef2f6] border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-40">
          <div>
            <div className="flex items-center gap-3">
              {/* Building Icon */}
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-700 text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              {/* Organization Name & Specialization */}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {name || "Organization Name"}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {category || "Corporate"}
                </p>
              </div>
            </div>

            {/* Badge (Buildings count) */}
            <div className="mt-2.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {buildings.length} {buildings.length === 1 ? "Building" : "Buildings"}
              </span>
            </div>
          </div>

          {/* Country Pill at bottom left */}
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              {country || "India"}
            </span>
          </div>
        </div>

        {/* Delete Organization Button (Admin only) */}
        {canDelete && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 bg-[#7a2233] hover:bg-[#651928] text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>{deleting ? "Deleting..." : "Delete Organization"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* ADDRESS DETAILS SECTION (Image 1)                              */}
      {/* ============================================================== */}
      <form onSubmit={handleSave}>
        <div className="space-y-6">
          {/* Row 1: Organization Name & Specialization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            {/* Organization Name */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                disabled={isReadOnly}
                onChange={(e) => setName(e.target.value)}
                placeholder="Organization Name"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
                required
              />
            </div>

            {/* Organization Specialization */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Organization Specialization
              </label>
              <input
                type="text"
                list="specialization-suggestions"
                value={category}
                disabled={isReadOnly}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Corporate, AI, Cloud Infrastructure"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
              />
              <datalist id="specialization-suggestions">
                <option value="Corporate" />
                <option value="AI & Machine Learning" />
                <option value="Cloud Infrastructure" />
                <option value="Telecom & Cyber Systems" />
                <option value="Enterprise Software & AI" />
                <option value="Fintech & Banking" />
                <option value="Healthcare & Biotech" />
                <option value="E-Commerce & Logistics" />
              </datalist>
            </div>
          </div>

          {/* Row 2: Street Address & Address Line 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Street Address
              </label>
              <input
                type="text"
                value={streetAddress}
                disabled={isReadOnly}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Street Address"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
              />
            </div>

            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Address Line 2
              </label>
              <input
                type="text"
                value={addressLine2}
                disabled={isReadOnly}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Address Line 2"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Row 3: City, State (Indian States Only), Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
            {/* City */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                City
              </label>
              <input
                type="text"
                value={city}
                disabled={isReadOnly}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
              />
            </div>

            {/* State (Indian States & UTs Only) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                State (India)
              </label>
              <div className="relative">
                <select
                  value={state}
                  disabled={isReadOnly}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 appearance-none focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs pr-10 cursor-pointer disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Country (Dropdown with chevron) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Country
              </label>
              <div className="relative">
                <select
                  value={country}
                  disabled={isReadOnly}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 appearance-none focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs pr-10 cursor-pointer disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CONTACT DETAILS SECTION (Image 2)                              */}
        {/* ============================================================== */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Contact Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
            {/* Contact Name */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Contact Name
              </label>
              <input
                type="text"
                value={contactName}
                disabled={isReadOnly}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact Name"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
              />
            </div>

            {/* Contact Email (Validated) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                disabled={isReadOnly}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@company.com"
                maxLength={80}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
              />
            </div>

            {/* Phone Number (Strictly 10 digits) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Phone Number (10 digits)
              </label>
              <input
                type="tel"
                value={phone}
                disabled={isReadOnly}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
              />
              {phone && phone.length > 0 && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
                  {phone.length}/10
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ACTION BUTTONS (Save Changes & Cancel)                         */}
        {/* ============================================================== */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-start gap-4">
          {!isReadOnly && (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:shadow transition disabled:opacity-50 text-sm cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onBack) onBack();
            }}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition text-sm shadow-xs cursor-pointer"
          >
            {isReadOnly ? "Back to Organizations" : "Cancel"}
          </button>
        </div>
      </form>

      {/* ============================================================== */}
      {/* BUILDINGS SECTION (Below Edit Org section as requested)        */}
      {/* ============================================================== */}
      <div className="mt-14 pt-10 border-t-2 border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Buildings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Facilities and real estate registered under {name || "this organization"}
            </p>
          </div>

          {canAddBuilding && (
            <button
              type="button"
              onClick={() => setShowAddBuilding(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2.5 rounded-xl border border-slate-300 shadow-xs hover:shadow text-sm transition cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Building</span>
            </button>
          )}
        </div>

        {loadingBuildings ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800 mb-2"></div>
            <p>Loading buildings...</p>
          </div>
        ) : buildings.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300">
            <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              No buildings registered yet
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Add the first building or facility for this organization.
            </p>
            {canAddBuilding && (
              <button
                type="button"
                onClick={() => setShowAddBuilding(true)}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                + Add Building
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {buildings.map((b) => (
              <div
                key={b.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (onSelectBuilding) {
                    onSelectBuilding(b);
                  } else if (onViewBuildingInTab) {
                    onViewBuildingInTab(b, organization);
                  } else {
                    setEditingBuilding(b);
                  }
                }}
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
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate" title={b.name}>
                      {b.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {organization?.name || b.orgName}
                    </p>
                  </div>
                </div>

                {/* Building Bottom Section: Country badge & clickable details cue */}
                <div className="mt-auto pt-6 flex items-center justify-between">
                  {(b.country || organization?.country) ? (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center">
                      {b.country || organization?.country}
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

        {/* Add Building Modal Popup */}
        {showAddBuilding && (
          <AddBuildingModal
            organization={organization}
            onClose={() => setShowAddBuilding(false)}
            onSuccess={handleBuildingCreated}
          />
        )}

        {/* Building Details Information Modal */}
        {selectedBuildingDetails && (
          <BuildingDetailsModal
            building={selectedBuildingDetails}
            onClose={() => setSelectedBuildingDetails(null)}
          />
        )}
      </div>
    </div>
  );
}

export default EditOrganization;
