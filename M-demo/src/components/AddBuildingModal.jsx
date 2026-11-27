import { useState } from "react";
import { createBuilding } from "../services/buildingService";
import { toast } from "../context/ToastContext";

/**
 * AddBuildingModal Component
 * Modal form for registering a new facility / building belonging to a specific organization.
 *
 * @param {Object} props
 * @param {Object} props.organization - The parent organization object
 * @param {Function} props.onClose - Callback to close the modal dialog
 * @param {Function} props.onSuccess - Callback triggered with the newly created building
 */
function AddBuildingModal({ organization, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Submit building creation to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning("Please enter a building name");
      return;
    }

    try {
      setLoading(true);
      const createdBuilding = await createBuilding({
        name: name.trim(),
        orgId: organization?.id || "",
        orgName: organization?.name || "",
        country: organization?.country || "",
        floors: 4,
        status: "Operational"
      });
      toast.success(`Building "${name.trim()}" created successfully!`);
      if (onSuccess) onSuccess(createdBuilding);
      onClose();
    } catch (error) {
      console.error("Error creating building:", error);
      toast.error(error.message || "Failed to create building");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-7 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            Add Building
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-8">
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-medium text-slate-600 z-10">
                Building Name
              </label>
              <input
                type="text"
                placeholder="Building Name"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Action Buttons: Cancel on left, Create on right */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-medium text-sm transition cursor-pointer shadow-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${
                isFormValid && !loading
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBuildingModal;
