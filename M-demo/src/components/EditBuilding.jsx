import { useState } from "react";
import { updateBuilding, deleteBuilding } from "../services/buildingService";
import { toast } from "../context/ToastContext";

/**
 * Edit Building Component
 * Allows viewing and editing building details and its floor directory.
 * - Admin: Full access (Edit name, floors, save, and delete)
 * - Pro: Edit access (Edit name, floors, save; Delete button hidden)
 * - Plus: View only (All inputs read-only; Save, Delete, Add Floor hidden)
 */
function EditBuilding({
  building,
  organization,
  role = "plus",
  backLabel = "Back to Buildings",
  onBack,
  onSave,
  onDelete
}) {
  const normRole = (role || "plus").trim().toLowerCase();
  const isReadOnly = normRole === "plus";
  const canDelete = normRole === "admin";

  const [name, setName] = useState(building?.name || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Dynamic floors list: each item has floorNo and floorName
  const [floorsList, setFloorsList] = useState(() => {
    if (Array.isArray(building?.floorsList) && building.floorsList.length > 0) {
      return building.floorsList;
    }
    const count = Number(building?.floors) || 1;
    return Array.from({ length: count }, (_, i) => ({
      floorNo: String(i + 1),
      floorName: i === 0 ? "Ground Floor" : `Floor ${i + 1}`
    }));
  });

  // Derived org name and country for preview
  const orgName = building?.orgName || organization?.name || "";
  const country = building?.country || organization?.country || "India";

  // Add a new floor entry
  const handleAddFloor = () => {
    if (isReadOnly) return;
    setFloorsList((prev) => [
      ...prev,
      {
        floorNo: String(prev.length + 1),
        floorName: `Floor ${prev.length + 1}`
      }
    ]);
  };

  // Update specific floor field
  const handleFloorChange = (index, field, value) => {
    if (isReadOnly) return;
    setFloorsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Remove a floor
  const handleRemoveFloor = (index) => {
    if (isReadOnly) return;
    setFloorsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Save (Allowed for Admin and Pro; blocked for Plus)
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (isReadOnly) {
      toast.warning("View only mode: you cannot edit building details");
      return;
    }

    if (!name.trim()) {
      toast.warning("Building name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const cleanFloorsList = floorsList.map((f, i) => ({
        floorNo: (f.floorNo || "").trim() || String(i + 1),
        floorName: (f.floorName || "").trim() || `Floor ${i + 1}`
      }));

      const updatedData = {
        name: name.trim(),
        floors: cleanFloorsList.length,
        floorsList: cleanFloorsList
      };

      await updateBuilding(building.id, updatedData);
      toast.success(`Building "${name.trim()}" updated successfully!`);
      if (onSave) onSave({ ...building, ...updatedData });
    } catch (error) {
      console.error("Error saving building:", error);
      toast.error(error.message || "Failed to update building");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete (Admin only; blocked for Pro and Plus)
  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("Permission denied: only Admins can delete buildings");
      return;
    }

    try {
      setDeleting(true);
      await deleteBuilding(building.id);
      toast.success(`Building "${building.name}" deleted successfully!`);
      if (onDelete) onDelete(building.id);
    } catch (error) {
      console.error("Error deleting building:", error);
      toast.error("Failed to delete building: " + error.message);
    } finally {
      setDeleting(false);
    }
  };

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
          <span>{backLabel}</span>
        </button>
      </div>

      {/* Main Title & Role Badge */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isReadOnly ? "Building Details" : "Edit Building"}
        </h2>
        {isReadOnly && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            View Only
          </span>
        )}
      </div>

      {/* Top Left Section: Card Preview Thumbnail & Delete Building Button */}
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
                    d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                  />
                </svg>
              </div>

              {/* Building Name */}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {name || "Building Name"}
                </h4>
                {orgName && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {orgName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Country Pill at bottom left */}
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              {country}
            </span>
          </div>
        </div>

        {/* Delete Building Button (Admin Only) */}
        {canDelete && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 bg-[#7a2233] hover:bg-[#651928] text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>{deleting ? "Deleting..." : "Delete Building"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Building Form */}
      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Field 1: Building Name */}
        <div className="relative">
          <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-xs font-semibold text-slate-600 z-10">
            Building Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            disabled={isReadOnly}
            onChange={(e) => setName(e.target.value)}
            placeholder="Building Name"
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Field 2: Floors Section */}
        <div className="border border-slate-300 rounded-2xl p-6 bg-white space-y-4 shadow-xs">
          {/* Add Floor Button (Admin & Pro only) */}
          <div className="flex items-center justify-between">
            {!isReadOnly ? (
              <button
                type="button"
                onClick={handleAddFloor}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2.5 rounded-xl border border-slate-300 shadow-xs hover:shadow text-sm transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>add floor</span>
              </button>
            ) : (
              <span className="text-sm font-bold text-slate-800">Floors Directory</span>
            )}

            <span className="text-xs font-medium text-slate-400">
              {floorsList.length} {floorsList.length === 1 ? "floor" : "floors"}
            </span>
          </div>

          {/* Floor Rows List: [floor no] and [floorname] */}
          <div className="space-y-3 pt-1">
            {floorsList.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Floor Number Input */}
                <div className="w-36 sm:w-44 shrink-0">
                  <input
                    type="text"
                    value={item.floorNo}
                    disabled={isReadOnly}
                    onChange={(e) => handleFloorChange(index, "floorNo", e.target.value)}
                    placeholder="floor no"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Floor Name Input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={item.floorName}
                    disabled={isReadOnly}
                    onChange={(e) => handleFloorChange(index, "floorName", e.target.value)}
                    placeholder="floorname"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs disabled:bg-slate-50 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Remove floor button (Admin & Pro only) */}
                {!isReadOnly && floorsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFloor(index)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0"
                    title="Remove floor"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Buttons: Save Changes & Cancel */}
        <div className="flex items-center gap-3 pt-4">
          {!isReadOnly && (
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-xs text-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span>Saving...</span>
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
            {isReadOnly ? "Back to Buildings" : "Cancel"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBuilding;
