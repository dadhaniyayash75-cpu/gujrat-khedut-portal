import React from 'react';

export default function GovtPortalsGrid({ lang, isDark }) {
  const portals = [
    {
      title_gu: "i-Khedut પોર્ટલ (ikhedut.gujarat.gov.in)",
      title_en: "i-Khedut Portal (Gujarat Government)",
      url: "https://ikhedut.gujarat.gov.in",
      desc_gu: "ટ્રેક્ટર, ઓજારો, બાગાયત, ટપક સિંચાઈ, પશુપાલન અને ખેતી સહાય માટેનું મુખ્ય પોર્ટલ.",
      desc_en: "The primary portal for farm machinery, horticulture, livestock, and direct subsidies.",
      tag_gu: "સૌથી મોટું પોર્ટલ",
      tag_en: "Primary Portal",
      badgeColor: "bg-emerald-500",
      icon: "🌾"
    },
    {
      title_gu: "GAIC એગ્રો ઇન્ડસ્ટ્રીઝ (gaic.gujarat.gov.in)",
      title_en: "GAIC Ltd. (Gujarat Agro Industries)",
      url: "https://gaic.gujarat.gov.in",
      desc_gu: "કોલ્ડ સ્ટોરેજ, એગ્રો ફૂડ પ્રોસેસિંગ યુનિટ્સ, FPO સંગઠન અને કૃષિ સાધનોના ટેસ્ટીંગ સહાય.",
      desc_en: "Cold chain storage, agro food processing units, FPO promotion, and testing subsidies.",
      tag_gu: "એગ્રો બિઝનેસ",
      tag_en: "Agro Business",
      badgeColor: "bg-amber-500",
      icon: "🏭"
    },
    {
      title_gu: "કૃષિ વિભાગ પોર્ટલ (agri.gujarat.gov.in)",
      title_en: "Dept of Agriculture (agri.gujarat.gov.in)",
      url: "https://agri.gujarat.gov.in",
      desc_gu: "કૃષિ, ખેડૂત કલ્યાણ અને સહકાર વિભાગ - રાજ્યની અધિકૃત કૃષિ નીતિઓ અને MKSY રાહત.",
      desc_en: "Department of Agriculture, Farmers Welfare & Cooperation policies and MKSY crop relief.",
      tag_gu: "મુખ્ય વિભાગ",
      tag_en: "Government Dept",
      badgeColor: "bg-blue-500",
      icon: "🏛️"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="text-center max-w-3xl mx-auto mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-950/60 dark:text-green-400 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
          🏛️ સત્તાવાર સરકારી પોર્ટલ્સ / Official Portals
        </span>
        <h3 className={`text-xl sm:text-2xl font-extrabold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {lang === 'gu' ? 'ગુજરાત સરકારની અધિકૃત કૃષિ વેબસાઇટ્સ' : 'Official Gujarat Agriculture Portals'}
        </h3>
        <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {lang === 'gu'
            ? 'આ તમામ પોર્ટલ પરથી મેળવેલ અધિકૃત યોજનાઓ અને સહાયની લિંક્સ નીચે ઉપલબ્ધ છે'
            : 'Access verified schemes and direct portals sourced from Gujarat Government websites'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {portals.map((p, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 border transition-all hover:shadow-lg flex flex-col justify-between ${
              isDark
                ? 'bg-slate-800/90 border-slate-700 hover:border-green-500 text-white'
                : 'bg-white border-slate-200 hover:border-green-500 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl p-2 rounded-xl bg-green-50 dark:bg-slate-700/60 border border-green-200 dark:border-slate-600">
                  {p.icon}
                </span>
                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                  {lang === 'gu' ? p.tag_gu : p.tag_en}
                </span>
              </div>

              <h4 className="text-base font-bold leading-snug">
                {lang === 'gu' ? p.title_gu : p.title_en}
              </h4>

              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {lang === 'gu' ? p.desc_gu : p.desc_en}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition shadow-xs"
              >
                <span>સત્તાવાર સાઇટ ખોલો ➔</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
