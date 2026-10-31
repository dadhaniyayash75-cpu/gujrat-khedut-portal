import React from 'react';

export default function HowToApply({ lang, isDark }) {
  const steps = [
    {
      step: "01",
      title_gu: "યોજના પસંદ કરો",
      title_en: "Select Scheme",
      desc_gu: "પોર્ટલ પર તમારી જરૂરિયાત મુજબની યોજના (ટ્રેક્ટર, પાઇપલાઇન, ગ્રીનહાઉસ કે GAIC) પસંદ કરો.",
      desc_en: "Choose the relevant subsidy scheme from i-Khedut or GAIC.",
      icon: "🔍"
    },
    {
      step: "02",
      title_gu: "દસ્તાવેજો તૈયાર રાખો",
      title_en: "Prepare Documents",
      desc_gu: "જમીનના ૭/૧૨ - ૮-અ ઉતારા, આધાર કાર્ડ, બેંક પાસબુક અને ડીલર ક્વોટેશન સાથે રાખો.",
      desc_en: "Keep 7/12 & 8-A land records, Aadhaar, bank passbook, and dealer quotation ready.",
      icon: "📑"
    },
    {
      step: "03",
      title_gu: "ઓનલાઇન અરજી સબમિટ કરો",
      title_en: "Submit Online",
      desc_gu: "i-Khedut અથવા GAIC પર ફોર્મ ભરી પ્રિન્ટ મેળવી સાચવી રાખો.",
      desc_en: "Fill out the online application and download the confirmation acknowledgement.",
      icon: "💻"
    },
    {
      step: "04",
      title_gu: "મંજૂરી અને સબસિડી જમા",
      title_en: "Approval & Subsidy",
      desc_gu: "અધિકારીની ચકાસણી બાદ સહાય સીધી તમારા બેંક ખાતામાં (DBT) જમા થશે.",
      desc_en: "Post verification, approved subsidy amount is credited directly to bank account.",
      icon: "💰"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className={`rounded-3xl p-6 sm:p-10 border shadow-xs ${
        isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-950/60 dark:text-green-400 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
            📝 અરજી માર્ગદર્શન / Step-by-Step
          </span>
          <h3 className={`text-xl sm:text-2xl font-extrabold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {lang === 'gu' ? 'i-Khedut અને GAIC પર અરજી કરવાની સરળ રીત' : 'How to Apply on i-Khedut & GAIC Portals'}
          </h3>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'gu'
              ? 'તમારા સ્માર્ટફોનથી અથવા ગ્રામ પંચાયતના VCE સેન્ટર પરથી ૪ સરળ સ્ટેપમાં અરજી કરો'
              : 'Apply in 4 simple steps from your mobile phone or nearest village center'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border relative flex flex-col justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-black text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-md">
                    STEP {s.step}
                  </span>
                </div>
                <h4 className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'gu' ? s.title_gu : s.title_en}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {lang === 'gu' ? s.desc_gu : s.desc_en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
