import React from 'react';

export default function SchemeFilters({
  t,
  selectedGovt,
  setSelectedGovt,
  selectedCategory,
  setSelectedCategory,
  totalFound,
  hasActiveFilters,
  onReset,
  isDark
}) {
  return (
    <div className={`rounded-2xl p-5 border shadow-xs mb-8 transition-colors ${
      isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-700' : 'border-slate-100'
      }`}>
        <div>
          <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <span>📑</span> {t.filterHeading}
          </h3>
          <p className="text-xs text-slate-400">
            {totalFound} {t.schemesFound}
          </p>
        </div>

        {/* GOVT TABS */}
        <div className={`flex items-center p-1 rounded-xl gap-1 self-start md:self-auto ${
          isDark ? 'bg-slate-900' : 'bg-slate-100'
        }`}>
          <button
            onClick={() => setSelectedGovt("all")}
            className={`text-xs font-semibold px-3 py-2 rounded-lg transition ${
              selectedGovt === "all" 
                ? (isDark ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-green-800 shadow-xs')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            {t.allGovt}
          </button>
          <button
            onClick={() => setSelectedGovt("gujarat")}
            className={`text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1 ${
              selectedGovt === "gujarat" 
                ? (isDark ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-green-800 shadow-xs')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            🏛️ {t.gujaratGovt}
          </button>
          <button
            onClick={() => setSelectedGovt("central")}
            className={`text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1 ${
              selectedGovt === "central" 
                ? (isDark ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-green-800 shadow-xs')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            🇮🇳 {t.centralGovt}
          </button>
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div className="pt-4">
        <div className="text-xs font-semibold text-slate-400 mb-2">કેટેગરી પસંદ કરો / Category:</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(t.categories).map(([key, label]) => {
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                  isActive
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : isDark
                      ? 'bg-slate-900/60 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESET FILTERS */}
      {hasActiveFilters && (
        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'
        }`}>
          <span>ફિલ્ટર સક્રિય છે</span>
          <button
            onClick={onReset}
            className="text-green-500 hover:text-green-400 font-semibold underline"
          >
            {t.resetFilters}
          </button>
        </div>
      )}
    </div>
  );
}
