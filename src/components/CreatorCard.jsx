import React from 'react';

export default function CreatorCard({ lang, isDark }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
      <div className={`rounded-3xl p-6 sm:p-8 border-2 transition-all relative overflow-hidden shadow-sm ${
        isDark
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-800/80 to-green-950/40 border-amber-500/50'
          : 'bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-green-500/10 border-amber-300'
      }`}>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          
          {/* CUSTOM YD BRAND LOGO */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-green-800 via-emerald-800 to-green-900 border-3 border-amber-400 p-2 shadow-xl flex items-center justify-center relative group hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="#facc15" strokeWidth="2.5" strokeDasharray="4 2" />
                <path d="M50 12 Q52 6 58 8 Q54 12 50 12" fill="#facc15" />
                <path d="M44 16 Q40 10 46 8 Q46 14 44 16" fill="#facc15" />
                <path d="M26 26 L42 50 L42 74 M58 26 L42 50" stroke="#fef08a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M56 26 L56 74 C72 74 78 64 78 50 C78 36 72 26 56 26 Z" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="50" r="3" fill="#facc15" />
              </svg>
            </div>
            <span className="mt-2 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              YD BRAND LOGO
            </span>
          </div>

          {/* CREATOR INFORMATION IN ENGLISH */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-300 dark:border-green-700 mb-2">
              <span>🌾</span>
              <span>Portal Founder & Creator</span>
            </div>

            {/* NAME IN ENGLISH */}
            <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Yash Dadhaniya
            </h3>

            {/* VILLAGE DETAILS IN ENGLISH */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1.5 text-xs sm:text-sm font-semibold">
              <span className={`flex items-center gap-1 px-3 py-1 rounded-lg border shadow-2xs ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                🏡 Village: Buri
              </span>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-lg border shadow-2xs text-green-600 dark:text-green-400 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                📍 Gujarat, India
              </span>
            </div>

            <p className={`mt-3 text-xs sm:text-sm leading-relaxed max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              This dedicated portal is created and conceptualized by <b>Yash Dadhaniya (Village: Buri)</b> to ensure every farmer across Gujarat can seamlessly access state subsidies (i-Khedut, GAIC, GGRC, Agri Dept) and Central Government schemes with full transparency and zero middlemen.
            </p>
          </div>

          {/* BADGE */}
          <div className={`flex-shrink-0 p-4 rounded-2xl border shadow-xs text-center min-w-[150px] ${
            isDark ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="text-xs text-slate-400 font-semibold">Farmer Service Mission</div>
            <div className="text-lg font-black text-green-600 dark:text-green-400 mt-1">100% Free</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Direct Govt Subsidies</div>
          </div>

        </div>
      </div>
    </section>
  );
}
