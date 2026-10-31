import React from 'react';

export default function Hero({ lang, t, searchTerm, setSearchTerm, isDark }) {
  const popularTags = [
    "ટ્રેક્ટર (Tractor)",
    "GAIC કોલ્ડ સ્ટોરેજ",
    "બાગાયત ગ્રીનહાઉસ",
    "PM-Kisan",
    "કડબ કટર (Chaff Cutter)",
    "ટપક સિંચાઈ (Drip)"
  ];

  return (
    <section className={`relative py-10 sm:py-14 border-b transition-colors ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-slate-800' 
        : 'bg-gradient-to-b from-green-50 via-white to-slate-50 border-slate-200'
    }`}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-green-300 dark:border-green-800 mb-4">
          <span>i-Khedut • GAIC • કૃષિ વિભાગ • કેન્દ્ર સરકાર સબસિડી</span>
        </div>
        
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-snug ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {lang === "gu" ? (
            <>ખેડૂત મિત્રો માટે <span className="text-green-500">તમામ સરકારી યોજનાઓ</span> એક જ પોર્ટલ પર</>
          ) : (
            <>All <span className="text-green-500">Government Schemes & Subsidies</span> for Gujarat Farmers</>
          )}
        </h2>
        
        <p className={`mt-3 text-sm sm:text-base max-w-2xl mx-auto ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {lang === "gu" 
            ? "ગુજરાત સરકાર (i-Khedut, GAIC, GGRC, કૃષિ વિભાગ) અને ભારત સરકાર (PM-KISAN, PMFBY) ની અધિકૃત માહિતી, પાત્રતા અને સીધી અરજી કરવાની લિંક."
            : "Verified official information from i-Khedut, GAIC, GGRC, Gujarat Agri Department and PM-Kisan with direct apply links."
          }
        </p>

        {/* SEARCH BAR */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className={`relative flex items-center shadow-lg rounded-2xl border-2 focus-within:border-green-500 overflow-hidden transition ${
            isDark 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-green-500/50'
          }`}>
            <span className="pl-4 text-xl text-slate-400">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full py-3.5 sm:py-4 px-3 placeholder-slate-400 focus:outline-none text-sm sm:text-base font-medium ${
                isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
              }`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="mr-2 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg"
              >
                ✕
              </button>
            )}
          </div>

          {/* POPULAR SEARCH TAGS */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold">{lang === "gu" ? "લોકપ્રિય શોધો:" : "Popular:"}</span>
            {popularTags.map((tag, i) => (
              <button
                key={i}
                onClick={() => setSearchTerm(tag.split(" ")[0])}
                className={`px-2.5 py-1 rounded-full border transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-white hover:bg-green-100 text-slate-700 border-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <div className={`p-3.5 rounded-xl border shadow-xs ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="text-2xl font-black text-green-500">૧૨+</div>
            <div className="text-xs text-slate-400 font-medium">{lang === "gu" ? "સત્તાવાર યોજનાઓ" : "Official Schemes"}</div>
          </div>
          <div className={`p-3.5 rounded-xl border shadow-xs ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="text-2xl font-black text-amber-500">૩૫%</div>
            <div className="text-xs text-slate-400 font-medium">{lang === "gu" ? "GAIC કોલ્ડ સ્ટોરેજ સબસિડી" : "GAIC Cold Chain Subsidy"}</div>
          </div>
          <div className={`p-3.5 rounded-xl border shadow-xs ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="text-2xl font-black text-emerald-500">૮૫%</div>
            <div className="text-xs text-slate-400 font-medium">{lang === "gu" ? "ટપક સિંચાઈ સબસિડી" : "Drip Subsidy"}</div>
          </div>
          <div className={`p-3.5 rounded-xl border shadow-xs ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="text-2xl font-black text-blue-500">૦%</div>
            <div className="text-xs text-slate-400 font-medium">{lang === "gu" ? "MKSY પાક સહાય પ્રીમિયમ" : "MKSY Zero Premium"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
