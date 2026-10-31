import React from 'react';

export default function EligibilityQuiz({
  t,
  quizLand,
  setQuizLand,
  quizInterest,
  setQuizInterest,
  quizResultCount,
  onRunQuiz,
  isDark
}) {
  return (
    <section id="calculator" className={`py-12 px-4 sm:px-6 border-t transition-colors ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-gradient-to-b from-slate-100 to-white border-slate-200'
    }`}>
      <div className={`max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 border shadow-md transition-colors ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-3xl">🧮</span>
          <h3 className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t.calculatorTitle}
          </h3>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t.calculatorSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* QUESTION 1 */}
          <div>
            <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              ૧. તમારી પાસે કેટલી ખેતીલાયક જમીન છે? (Land Holding)
            </label>
            <select
              value={quizLand}
              onChange={(e) => setQuizLand(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs sm:text-sm focus:border-green-600 focus:outline-none transition ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="">-- જમીન પસંદ કરો --</option>
              <option value="small">નાના અને સીમાંત ખેડૂત (૧ થી ૨ હેક્ટર સુધી)</option>
              <option value="medium">મધ્યમ ખેડૂત (૨ થી ૫ હેક્ટર સુધી)</option>
              <option value="large">મોટા ખેડૂત (૫ હેક્ટરથી વધુ)</option>
              <option value="landless">જમીન વિહોણા / પશુપાલક / ભાગીયા</option>
            </select>
          </div>

          {/* QUESTION 2 */}
          <div>
            <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              ૨. તમારી પ્રાથમિક જરૂરિયાત શું છે? (Main Requirement)
            </label>
            <select
              value={quizInterest}
              onChange={(e) => setQuizInterest(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs sm:text-sm focus:border-green-600 focus:outline-none transition ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="">-- જરૂરિયાત પસંદ કરો --</option>
              <option value="machinery">ટ્રેક્ટર અને ખેતી ઓજારો (i-Khedut Tractor)</option>
              <option value="processing">કોલ્ડ સ્ટોરેજ / એગ્રો પ્રોસેસિંગ (GAIC)</option>
              <option value="horticulture">ગ્રીનહાઉસ / બાગાયતી ખેતી (Horticulture)</option>
              <option value="animal">પશુપાલન અને કડબ કટર (Animal Husbandry)</option>
              <option value="irrigation">ટપક સિંચાઈ અથવા સોલાર પંપ (Drip & Solar)</option>
              <option value="financial">રોકડ સહાય અથવા સસ્તી લોન (PM-Kisan/KCC)</option>
              <option value="organic">ગાય આધારિત પ્રાકૃતિક ખેતી (Desi Cow)</option>
            </select>
          </div>
        </div>

        <div className={`mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="text-xs text-slate-400">
            {quizResultCount !== null && (
              <span className="font-semibold text-green-400 bg-green-950/60 px-3 py-1.5 rounded-lg border border-green-800">
                ✅ તમારા માટે {quizResultCount} યોજનાઓ ઉપલબ્ધ છે!
              </span>
            )}
          </div>
          <button
            onClick={onRunQuiz}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-green-600/20 transition flex items-center justify-center gap-2"
          >
            <span>{t.checkEligibilityBtn}</span> ➔
          </button>
        </div>
      </div>
    </section>
  );
}
