import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we add a huge banner for the Vehicle & Rental Service
banner_code = r"""
          {/* VEHICLE & RENTAL SERVICE HIGHLIGHT BANNER */}
          {user && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full">
              <div className="bg-gradient-to-r from-green-600 to-emerald-800 rounded-3xl p-6 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="relative z-10 flex-1">
                  <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2">
                    🚜 {lang === "gu" ? "વાહનો અને કૃષિ સાધનો ભાડે મેળવો!" : "Vehicle & Transport Rental Service"}
                  </h2>
                  <p className="text-emerald-100 font-medium text-sm sm:text-base max-w-2xl">
                    {lang === "gu" 
                      ? "તમારા ગામની 20km ની હદમાં ઉપલબ્ધ ટ્રેક્ટર, હાર્વેસ્ટર અને પરિવહન વાહનો ભાડે મેળવો અથવા તમારી સેવાઓ પ્રદાન કરો." 
                      : "Rent tractors, harvesters, and transport vehicles within a 20km radius of your village, or offer your own services."}
                  </p>
                </div>
                <div className="relative z-10 w-full md:w-auto">
                  <button 
                    onClick={() => setCurrentPage('services')}
                    className="w-full md:w-auto bg-white text-green-700 hover:bg-green-50 font-black text-lg px-8 py-4 rounded-xl shadow-lg transition-transform transform hover:scale-105"
                  >
                    {lang === "gu" ? "અહીં ક્લિક કરો (Open Marketplace) ➔" : "Open Marketplace ➔"}
                  </button>
                </div>
              </div>
            </section>
          )}
"""

# Insert right above HERO BANNER
hero_pattern = r"(\s*{/\* HERO BANNER \*/})"
if "VEHICLE & RENTAL SERVICE HIGHLIGHT BANNER" not in content:
    content = re.sub(hero_pattern, banner_code + r"\1", content, count=1)

# Also let's modify ServiceMarketplace to support Provider View
provider_view_pattern = r"(const handleSearch = \(\) => \{)"
if "PROVIDER VIEW" not in content:
    provider_view_replacement = r"""
      // --- PROVIDER VIEW ---
      if (user && user.role === 'provider') {
        return (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={onBack} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100 border'}`}>
                ← {lang === "gu" ? "પાછા જાઓ" : "Go Back"}
              </button>
              <h2 className="text-2xl font-extrabold">{lang === "gu" ? "સર્વિસ પ્રોવાઈડર ડેશબોર્ડ" : "Service Provider Dashboard"}</h2>
            </div>
            <div className={`p-8 rounded-3xl border shadow-sm text-center ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="text-5xl mb-4">🚜</div>
              <h3 className="text-xl font-black mb-2">{lang === "gu" ? `સ્વાગત છે, ${user.name}!` : `Welcome, ${user.name}!`}</h3>
              <p className="text-slate-500 mb-6">{lang === "gu" ? `તમારી પ્રોફાઇલ મુજબ, તમારું ગામ ${village || 'અજ્ઞાત'} છે. તમારા 20km ના વિસ્તારના ખેડૂતો જ્યારે ભાડે સાધનો શોધશે ત્યારે તમારી પ્રોફાઇલ તેમને દેખાશે.` : `Based on your profile, your village is ${village || 'Unknown'}. Farmers within 20km will see your services when they search.`}</p>
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg font-bold text-sm border border-green-200 dark:border-green-800">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                {lang === "gu" ? "તમારી પ્રોફાઇલ એક્ટિવ છે" : "Your profile is active"}
              </div>
            </div>
          </div>
        );
      }

      \1"""
    content = re.sub(provider_view_pattern, provider_view_replacement, content, count=1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Large banner and Provider view added.")
