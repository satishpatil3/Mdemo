/**
 * OrganizationCard Component
 * Renders an organization summary card with consistent building-height styling (min-h-[210px]),
 * black border icon styling, corporate title, category, and regional country badge.
 *
 * @param {Object} props
 * @param {Object} props.organization - The organization data object
 * @param {Function} props.onSelect - Callback invoked when user clicks the card
 */
function OrganizationCard({ organization = {}, onSelect }) {
  const { name = "Unnamed Organization", country = "", category = "" } = organization || {};

  // Handle card selection click
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(organization);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
        }
      }}
      className="bg-white rounded-2xl border border-slate-300 shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 p-6 flex flex-col justify-between min-h-[210px] group relative cursor-pointer select-none"
    >
      {/* Top Section: Icon + Organization Title */}
      <div className="flex items-start gap-4">
        {/* Organization Icon Box: White background with black border & black icon */}
        <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
          <svg
            className="w-5 h-5 text-slate-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>

        {/* Organization Name & Category */}
        <div className="flex-1 min-w-0 pr-2">
          <h3
            className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors"
            title={name}
          >
            {name}
          </h3>
          {category && (
            <p className="text-xs text-slate-500 font-medium mt-1">
              {category}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section: Country Badge (Shown when country has been provided) */}
      {country && country.trim().length > 0 && (
        <div className="mt-auto pt-6 flex items-center justify-start">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center">
            {country}
          </span>
        </div>
      )}
    </div>
  );
}

export default OrganizationCard;
