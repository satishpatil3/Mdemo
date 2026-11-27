/**
 * FeatureCard Component
 * Displays an interactive or informative card tile with an icon, title, description, and action cue.
 *
 * @param {Object} props
 * @param {string} props.title - Title displayed on the card
 * @param {string} props.description - Explanatory text beneath the title
 * @param {Function} [props.onClick] - Optional click handler for interactive cards
 */
function FeatureCard({ title, description, onClick }) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(e);
        }
      }}
      className={`bg-white rounded-2xl border border-slate-300 p-6 min-h-[210px] shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 flex flex-col justify-between select-none ${
        onClick ? "cursor-pointer group" : ""
      }`}
    >
      <div>
        <div className="flex items-center gap-3.5 mb-3">
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
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
            {title}
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-auto pt-6 flex items-center justify-end text-xs font-medium text-slate-400 group-hover:text-blue-600 transition">
        <span className="flex items-center gap-1">
          Open
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default FeatureCard;
