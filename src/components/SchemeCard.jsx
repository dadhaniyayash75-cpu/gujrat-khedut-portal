import React from 'react';

export default function SchemeCard({ scheme, lang, t, onSelect, onShareWhatsapp, isDark }) {
  const isGujarat = scheme.govType === "gujarat";
  const sourceLabel = scheme.sourceDept === "ikhedut" 
    ? "i-Khedut" 
    : scheme.sourceDept === "gaic" 
      ? "GAIC" 
      : scheme.sourceDept === "agri_dept" 
        ? "Agri Dept" 
        : "Central Govt";

  return (
    <div className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group ${
      isDark 
        ? 'bg-slate-800/90 border-slate-700 hover:border-green-500 hover:shadow-lg hover:shadow-green-950/30' 
        : 'bg-white border-slate-200 hover:border-green-400 hover:shadow-md'
    }`}>
      <div>
        {/* CARD HEADER */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <span className={`text-3xl p-2 rounded-xl border group-hover:scale-110 transition-transform ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-green-50 border-green-100'
            }`}>
              {scheme.icon}
            </span>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                scheme.sourceDept === "gaic"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                  : isGujarat 
                    ? "bg-green-50 dark:bg-green-950/60 text-green-900 dark:text-green-300 border-green-300 dark:border-green-800" 
                    : "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800"
              }`}>
                {sourceLabel}
              </span>
              {scheme.badge_gu && (
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  {lang === "gu" ? scheme.badge_gu : scheme.badge_en}
                </span>
              )}
            </div>
          </div>

          <h4 className={`text-base sm:text-lg font-bold group-hover:text-green-600 dark:group-hover:text-green-400 transition leading-snug ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {lang === "gu" ? scheme.title_gu : scheme.title_en}
          </h4>
          
          <p className={`text-xs mt-1 font-medium line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {lang === "gu" ? scheme.dept_gu : scheme.dept_en}
          </p>
        </div>

        {/* BENEFITS HIGHLIGHT */}
        <div className={`px-5 py-3 border-y ${
          isDark 
            ? 'bg-slate-900/60 border-slate-700/80 text-emerald-400' 
            : 'bg-green-50/60 border-green-100 text-green-800'
        }`}>
          <div className="text-[11px] font-bold uppercase tracking-wide">
            {t.benefits}:
          </div>
          <p className={`text-xs font-semibold mt-0.5 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {lang === "gu" ? scheme.benefit_gu : scheme.benefit_en}
          </p>
        </div>

        {/* ELIGIBILITY & DEADLINE */}
        <div className={`p-5 pt-3 space-y-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.eligibility}: </span>
            <span className="line-clamp-2">{lang === "gu" ? scheme.eligibility_gu : scheme.eligibility_en}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>⏱️ {t.deadline}:</span>
            <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {lang === "gu" ? scheme.deadline_gu : scheme.deadline_en}
            </span>
          </div>
        </div>
      </div>

      {/* CARD FOOTER */}
      <div className="p-5 pt-0">
        <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <button
            onClick={() => onSelect(scheme)}
            className={`w-full text-xs font-semibold py-2 px-2.5 rounded-xl transition text-center ${
              isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            📋 {lang === "gu" ? "વિગત અને કાગળો" : "Checklist"}
          </button>
          <a
            href={scheme.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-xs font-semibold py-2 px-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white transition text-center shadow-xs"
          >
            🔗 {lang === "gu" ? "અરજી કરો" : "Apply Now"}
          </a>
        </div>
        <button
          onClick={() => onShareWhatsapp(scheme)}
          className="mt-2 w-full text-[11px] font-medium py-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition flex items-center justify-center gap-1"
        >
          <span>💬 {t.shareWhatsapp}</span>
        </button>
      </div>
    </div>
  );
}
