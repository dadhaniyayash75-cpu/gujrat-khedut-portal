import React from 'react';

export default function SchemeModal({
  scheme,
  lang,
  t,
  onClose,
  checkedDocs,
  onToggleDoc,
  onShareWhatsapp,
  isDark
}) {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        
        {/* HEADER */}
        <div className="p-6 bg-gradient-to-r from-green-800 to-emerald-800 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white/10 p-2.5 rounded-2xl">{scheme.icon}</span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                {scheme.govType === "gujarat" ? "ગુજરાત સરકાર માન્ય" : "ભારત સરકાર માન્ય"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold mt-1 text-white leading-snug">
                {lang === "gu" ? scheme.title_gu : scheme.title_en}
              </h3>
              <p className="text-xs text-amber-200 font-semibold mt-0.5">
                {lang === "gu" ? scheme.dept_gu : scheme.dept_en}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs sm:text-sm">
          {/* BENEFITS */}
          <div className={`rounded-2xl p-4 border ${
            isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <h5 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <span>💰</span> {t.benefits}
            </h5>
            <p className={`font-medium mt-1 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {lang === "gu" ? scheme.benefit_gu : scheme.benefit_en}
            </p>
          </div>

          {/* ELIGIBILITY */}
          <div>
            <h5 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-400">
              <span>🎯</span> {t.eligibility}
            </h5>
            <p className={`mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {lang === "gu" ? scheme.eligibility_gu : scheme.eligibility_en}
            </p>
          </div>

          {/* DOCUMENT CHECKLIST */}
          <div className={`rounded-2xl p-4 border ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <span>📋</span> {t.docChecklist}
              </h5>
              <span className="text-[11px] text-slate-400">તમારા દસ્તાવેજ ટીક કરો</span>
            </div>
            
            <div className="space-y-2 mt-3">
              {(lang === "gu" ? scheme.docs_gu : scheme.docs_en).map((doc, idx) => {
                const checkKey = `${scheme.id}-${idx}`;
                const isChecked = !!checkedDocs[checkKey];
                return (
                  <label
                    key={idx}
                    onClick={() => onToggleDoc(scheme.id, idx)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      isChecked
                        ? (isDark ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-emerald-50/80 border-emerald-300 text-emerald-900')
                        : (isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700')
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="mt-0.5 rounded text-green-600 focus:ring-0"
                    />
                    <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'font-medium'}`}>
                      {doc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* DEADLINE */}
          <div className={`flex items-center gap-2 text-xs p-3 rounded-xl border ${
            isDark ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <span className="text-base">📅</span>
            <div>
              <span className="font-bold">{t.deadline}: </span>
              <span>{lang === "gu" ? scheme.deadline_gu : scheme.deadline_en}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className={`p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={() => onShareWhatsapp(scheme)}
            className="w-full sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 transition flex items-center justify-center gap-1.5"
          >
            <span>💬 {t.shareWhatsapp}</span>
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className={`w-1/2 sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              બંધ કરો (Close)
            </button>
            <a
              href={scheme.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-1/2 sm:w-auto text-xs font-bold px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white transition text-center shadow-md shadow-green-600/20"
            >
              {t.directApply} ➔
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
