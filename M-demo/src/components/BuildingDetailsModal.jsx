/**
 * BuildingDetailsModal Component
 * Modal dialog that displays detailed facility information, floor count, and operational status.
 *
 * @param {Object} props
 * @param {Object} props.building - The building data object
 * @param {Function} props.onClose - Callback to close the modal
 */
function BuildingDetailsModal({ building, onClose }) {
  if (!building) return null;

  const isOperational = building.status === "Operational";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                {building.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {building.orgName || "Organization facility"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Information grid: Floors and Operational Status */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Floors */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Floors
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {building.floors || 4}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Levels
                </span>
              </div>
            </div>

            {/* Operational Status */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Operational Status
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isOperational
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOperational ? "bg-emerald-600" : "bg-amber-600"
                    }`}
                  ></span>
                  {building.status || "Operational"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuildingDetailsModal;
