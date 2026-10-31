import React from 'react';

export default function Navbar({
  lang,
  toggleLanguage,
  t,
  user,
  onOpenAuth,
  onLogout,
  theme,
  toggleTheme,
  isDark
}) {
  return (
    <>
      {/* NOTICE BAR */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900 text-white text-xs sm:text-sm py-2 px-4 shadow-sm border-b border-green-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-medium">{t.officialBadge}</span>
            <span className="hidden md:inline-block text-amber-300 font-bold">
              • Founder: Yash Dadhaniya (Village: Buri)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden lg:inline">📞 {t.kisanCallCenter}: <b>1800-180-1551</b></span>
            
            {/* THEME TOGGLE (LIGHT / DARK) */}
            <button
              onClick={toggleTheme}
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-2.5 py-1 rounded-full border border-white/30 transition flex items-center gap-1.5"
              title="થીમ બદલો / Switch Theme"
            >
              <span>{isDark ? '☀️' : '🌙'}</span>
              <span>{isDark ? (lang === 'gu' ? 'લાઇટ' : 'Light') : (lang === 'gu' ? 'ડાર્ક' : 'Dark')}</span>
            </button>

            {/* LANGUAGE TOGGLE */}
            <button 
              onClick={toggleLanguage}
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-3 py-1 rounded-full border border-white/30 transition flex items-center gap-1.5"
              title="ભાષા બદલો / Switch Language"
            >
              🌐 <span>{t.switchLang}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN HEADER WITH YD LOGO & ENGLISH FOUNDER NAME */}
      <header className={`sticky top-0 z-40 backdrop-blur border-b transition-colors ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* BRAND WITH YD LOGO */}
          <div className="flex items-center gap-3">
            {/* Custom YD Monogram Logo */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-800 via-emerald-800 to-green-900 border-2 border-amber-400 shadow-md p-1 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="46" stroke="#facc15" strokeWidth="3" strokeDasharray="3 2" />
                <path d="M28 28 L42 50 L42 72 M56 28 L42 50" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M56 28 L56 72 C70 72 76 62 76 50 C76 38 70 28 56 28 Z" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M50 14 Q52 8 58 10 Q54 14 50 14" fill="#facc15" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
                  {t.portalName}
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 hidden sm:inline-block">
                  YD
                </span>
              </div>
              <p className={`text-[11px] sm:text-xs font-semibold ${isDark ? 'text-amber-300/90' : 'text-emerald-700'}`}>
                Founder: Yash Dadhaniya (Village: Buri)
              </p>
            </div>
          </div>

          {/* USER PROFILE & CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className={`flex items-center gap-2 py-1.5 px-3 rounded-2xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-green-50 border-green-200'
              }`}>
                <div className="w-8 h-8 rounded-full bg-green-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {user.name}
                  </div>
                  <div className="text-[10px] text-green-500 font-medium">
                    {user.mobile}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="ml-1 text-[11px] font-semibold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-2 py-1 rounded-lg transition"
                >
                  {lang === 'gu' ? 'બહાર નીકળો' : 'Logout'}
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
              >
                🔐 <span>{lang === 'gu' ? 'ખાતું / સાઇન ઇન' : 'Sign In'}</span>
              </button>
            )}

            <a 
              href="#calculator" 
              className={`hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🧮 {t.calculatorTitle}
            </a>
          </div>

        </div>
      </header>
    </>
  );
}
