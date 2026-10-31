function App() {
      const [currentPage, setCurrentPage] = React.useState('home');

      const [lang, setLang] = useState("gu");
      const [searchTerm, setSearchTerm] = useState("");
      const [selectedGovt, setSelectedGovt] = useState("all");
      const [selectedCategory, setSelectedCategory] = useState("all");
      const [selectedScheme, setSelectedScheme] = useState(null);
      const [checkedDocs, setCheckedDocs] = useState({});

      // Light / Dark mode state
      const [theme, setTheme] = useState(() => {
        try {
          return localStorage.getItem("khedut_theme") || "light";
        } catch {
          return "light";
        }
      });
      const isDark = theme === "dark";

      const toggleTheme = () => {
        const next = isDark ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("khedut_theme", next);
      };

      const [user, setUser] = useState(() => {
        try {
          const saved = localStorage.getItem("khedut_user");
          return saved ? JSON.parse(saved) : null;
        } catch {
          return null;
        }
      });
      const [isAuthOpen, setIsAuthOpen] = useState(false);

      useEffect(() => {
        if (!user) {
          setIsAuthOpen(true);
        }
      }, [user]);

      const [quizLand, setQuizLand] = useState("");
      const [quizInterest, setQuizInterest] = useState("");
      const [quizResultCount, setQuizResultCount] = useState(null);

      const t = i18n[lang];

      const toggleLanguage = () => {
        setLang(prev => (prev === "gu" ? "en" : "gu"));
      };

      const handleLoginSuccess = (userData) => {
        setUser(userData);
        setIsAuthOpen(false);
      };

      const handleLogout = () => {
        localStorage.removeItem("khedut_user");
        setUser(null);
        setIsAuthOpen(true);
      };

      const filteredSchemes = useMemo(() => {
        return SCHEMES_DATA.filter(scheme => {
          if (selectedGovt !== "all" && scheme.govType !== selectedGovt) {
            return false;
          }
          if (selectedCategory !== "all" && scheme.categoryKey !== selectedCategory) {
            return false;
          }
          if (searchTerm.trim() !== "") {
            const query = searchTerm.toLowerCase();
            const titleGu = scheme.title_gu.toLowerCase();
            const titleEn = scheme.title_en.toLowerCase();
            const benefitGu = scheme.benefit_gu.toLowerCase();
            const benefitEn = scheme.benefit_en.toLowerCase();
            return (
              titleGu.includes(query) ||
              titleEn.includes(query) ||
              benefitGu.includes(query) ||
              benefitEn.includes(query)
            );
          }
          return true;
        });
      }, [selectedGovt, selectedCategory, searchTerm]);

      const handleShareWhatsapp = (scheme) => {
        const title = lang === "gu" ? scheme.title_gu : scheme.title_en;
        const benefit = lang === "gu" ? scheme.benefit_gu : scheme.benefit_en;
        const text = `🌾 *${title}*\n\n✅ લાભ: ${benefit}\n\n🔗 સત્તાવાર પોર્ટલ: ${scheme.portalUrl}\n\nCourtesy: Yash Dadhaniya (Village: Buri) - Gujarat Khedut Sahay.`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
      };

      const handleDocCheck = (schemeId, docIndex) => {
        const key = `${schemeId}-${docIndex}`;
        setCheckedDocs(prev => ({ ...prev, [key]: !prev[key] }));
      };

      const handleRunQuiz = () => {
        if (!quizInterest && !quizLand) return;
        if (quizInterest) {
          setSelectedCategory(quizInterest);
        }
        const matched = SCHEMES_DATA.filter(s => {
          if (quizInterest && quizInterest !== "all") {
            return s.categoryKey === quizInterest;
          }
          return true;
        });
        setQuizResultCount(matched.length);
        const el = document.getElementById("schemes-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      };

      const resetAllFilters = () => {
        setSearchTerm("");
        setSelectedGovt("all");
        setSelectedCategory("all");
        setQuizLand("");
        setQuizInterest("");
        setQuizResultCount(null);
      };

      return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
          isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
        }`}>
          
          <AuthModal
            isOpen={isAuthOpen}
            onLoginSuccess={handleLoginSuccess}
            lang={lang}
            isDark={isDark}
          />

          {/* TOP NOTICE WITH ENGLISH FOUNDER NAME & THEME BUTTON */}
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
                
                {/* LIGHT / DARK MODE TOGGLE */}
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
                >
                  🌐 <span>{t.switchLang}</span>
                </button>
              </div>
            </div>
          </div>

          {/* NAVBAR */}
          <header className={`sticky top-0 z-40 backdrop-blur border-b transition-colors ${
            isDark ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <YDLogo size="w-12 h-12" />
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

              {/* USER PROFILE */}
              <div className="flex items-center gap-2 sm:gap-3">
                {user ? (
                  <div className={`flex items-center gap-2 py-1.5 px-3 rounded-2xl border ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
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
                      onClick={handleLogout}
                      title="Logout"
                      className="ml-1 text-[11px] font-semibold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-2 py-1 rounded-lg transition"
                    >
                      {lang === "gu" ? "બહાર નીકળો" : "Logout"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-sm transition"
                  >
                    🔐 <span>{lang === "gu" ? "ખાતું / સાઇન ઇન" : "Sign In"}</span>
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

          {/* USER WELCOME STRIP */}
          {user && (
            <div className={`py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b ${
              isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <span>👋</span>
              <span>
                {lang === "gu"
                  ? `નમસ્તે, ${user.name}! (મો. ${user.mobile}) - ગુજરાત ખેડૂત સહાય પોર્ટલ પર તમારું સ્વાગત છે.`
                  : `Welcome, ${user.name}! (Mob: ${user.mobile}) to Gujarat Khedut Sahay Portal.`}
              </span>
            </div>
          )}
          {currentPage === 'services' ? (
            <ServiceMarketplace lang={lang} isDark={isDark} user={user} onBack={() => setCurrentPage('home')} />
          ) : currentPage === 'dashboard' ? (
            <ProviderDashboard lang={lang} isDark={isDark} user={user} />
          ) : (
            <>
          

          {/* MANDI TICKER */}
          <section className={`border-b py-2.5 px-4 overflow-hidden transition-colors ${
            isDark ? 'bg-amber-950/40 border-amber-800/60' : 'bg-amber-50 border-amber-200/80'
          }`}>
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <div className="flex-shrink-0 flex items-center gap-1.5 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                <span className="animate-pulse">●</span> {lang === "gu" ? "બજાર ભાવ" : "Mandi Rates"}
              </div>
              <div className="overflow-x-auto custom-scrollbar flex items-center gap-4 text-xs font-medium whitespace-nowrap">
                {MANDI_DATA.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1 rounded border shadow-2xs ${
                    isDark ? 'bg-slate-800 border-amber-900/50 text-slate-200' : 'bg-white border-amber-200/60 text-slate-700'
                  }`}>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lang === "gu" ? item.yard_gu : item.yard_en}:
                    </span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      {lang === "gu" ? item.crop_gu : item.crop_en}
                    </span>
                    <span className="font-bold text-green-500">{item.max}</span>
                    <span className="text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                      {item.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* VEHICLE & RENTAL SERVICE HIGHLIGHT BANNER */}
          {user && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full">
              <div className="bg-gradient-to-r from-green-600 to-emerald-800 rounded-3xl p-6 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="relative z-10 flex-1">
                  <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2">
                    🚜 {lang === "gu" ? (user.role === 'provider' ? "તમારી સેવાઓ મેનેજ કરો" : "વાહનો અને કૃષિ સાધનો ભાડે મેળવો!") : (user.role === 'provider' ? "Manage Your Services" : "Vehicle & Transport Rental Service")}
                  </h2>
                  <p className="text-emerald-100 font-medium text-sm sm:text-base max-w-2xl">
                    {lang === "gu" 
                      ? (user.role === 'provider' ? "તમારા ડેશબોર્ડ પરથી તમારી સેવાઓનું સંચાલન કરો અને ખેડૂતોની વિનંતીઓ (Requests) સ્વીકારો." : "તમારા ગામની 20km ની હદમાં ઉપલબ્ધ ટ્રેક્ટર, હાર્વેસ્ટર અને પરિવહન વાહનો ભાડે મેળવો.")
                      : (user.role === 'provider' ? "Manage your services and accept requests from nearby farmers." : "Rent tractors, harvesters, and transport vehicles within a 20km radius of your village.")}
                  </p>
                </div>
                <div className="relative z-10 w-full md:w-auto">
                  <button 
                    onClick={() => setCurrentPage(user.role === 'provider' ? 'dashboard' : 'services')}
                    className="w-full md:w-auto bg-white text-green-700 hover:bg-green-50 font-black text-lg px-8 py-4 rounded-xl shadow-lg transition-transform transform hover:scale-105"
                  >
                    {lang === "gu" ? (user.role === 'provider' ? "ડેશબોર્ડ ખોલો ➔" : "માર્કેટપ્લેસ ખોલો ➔") : (user.role === 'provider' ? "Open Dashboard ➔" : "Open Marketplace ➔")}
                  </button>
                </div>
              </div>
            </section>
          )}


          {/* HERO BANNER */}
          <section className={`relative py-10 sm:py-14 border-b transition-colors ${
            isDark ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-slate-800' : 'bg-gradient-to-b from-green-50 via-white to-slate-50 border-slate-200'
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

              {/* SEARCH */}
              <div className="mt-8 max-w-2xl mx-auto">
                <div className={`relative flex items-center shadow-lg rounded-2xl border-2 focus-within:border-green-500 overflow-hidden transition ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-500/50'
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

                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold">{lang === "gu" ? "લોકપ્રિય શોધો:" : "Popular:"}</span>
                  {["ટ્રેક્ટર (Tractor)", "GAIC કોલ્ડ સ્ટોરેજ", "બાગાયત ગ્રીનહાઉસ", "PM-Kisan", "કડબ કટર (Chaff Cutter)", "ટપક સિંચાઈ (Drip)"].map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchTerm(tag.split(" ")[0])}
                      className={`px-2.5 py-1 rounded-full border transition ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-green-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* STATS */}
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

          {/* CREATOR CARD: Yash Dadhaniya (Village: Buri) IN ENGLISH */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
            <div className={`rounded-3xl p-6 sm:p-8 border-2 transition-all relative overflow-hidden shadow-sm ${
              isDark ? 'bg-gradient-to-r from-emerald-950/40 via-slate-800/80 to-green-950/40 border-amber-500/50' : 'bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-green-500/10 border-amber-300'
            }`}>
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <YDLogo size="w-24 h-24 sm:w-28 sm:h-28" />
                  <span className="mt-2 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                    YD BRAND LOGO
                  </span>
                </div>

                <div className="text-center md:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-300 dark:border-green-700 mb-2">
                    <span>🌾</span>
                    <span>Portal Founder & Creator</span>
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Yash Dadhaniya
                  </h3>

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

          {/* OFFICIAL GUJARAT GOVT PORTALS: i-Khedut, GAIC, Agri Dept */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
            <div className="text-center max-w-3xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-950/60 dark:text-green-400 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                🏛️ સત્તાવાર સરકારી પોર્ટલ્સ / Official Portals
              </span>
              <h3 className={`text-xl sm:text-2xl font-extrabold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'gu' ? 'ગુજરાત સરકારની અધિકૃત કૃષિ વેબસાઇટ્સ' : 'Official Gujarat Agriculture Portals'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: "i-Khedut Portal (ikhedut.gujarat.gov.in)",
                  url: "https://ikhedut.gujarat.gov.in",
                  desc: "ટ્રેક્ટર, ઓજારો, બાગાયત, ટપક સિંચાઈ, પશુપાલન અને ખેતી સહાય માટેનું મુખ્ય પોર્ટલ.",
                  tag: "i-Khedut",
                  badgeColor: "bg-emerald-500",
                  icon: "🌾"
                },
                {
                  title: "GAIC Agro Industries (gaic.gujarat.gov.in)",
                  url: "https://gaic.gujarat.gov.in",
                  desc: "કોલ્ડ સ્ટોરેજ, એગ્રો ફૂડ પ્રોસેસિંગ યુનિટ્સ, FPO સંગઠન અને કૃષિ સાધનોના ટેસ્ટીંગ સહાય.",
                  tag: "GAIC Agro",
                  badgeColor: "bg-amber-500",
                  icon: "🏭"
                },
                {
                  title: "Department of Agriculture (agri.gujarat.gov.in)",
                  url: "https://agri.gujarat.gov.in",
                  desc: "કૃષિ, ખેડૂત કલ્યાણ અને સહકાર વિભાગ - રાજ્યની અધિકૃત કૃષિ નીતિઓ અને MKSY રાહત.",
                  tag: "Agri Dept",
                  badgeColor: "bg-blue-500",
                  icon: "🏛️"
                }
              ].map((p, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-5 border transition-all hover:shadow-lg flex flex-col justify-between ${
                    isDark ? 'bg-slate-800/90 border-slate-700 hover:border-green-500 text-white' : 'bg-white border-slate-200 hover:border-green-500 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl p-2 rounded-xl bg-green-50 dark:bg-slate-700/60 border border-green-200 dark:border-slate-600">
                        {p.icon}
                      </span>
                      <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                        {p.tag}
                      </span>
                    </div>
                    <h4 className="text-base font-bold leading-snug">{p.title}</h4>
                    <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.desc}</p>
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

          {/* 4-STEP HOW TO APPLY GUIDE */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: "01", title: "યોજના પસંદ કરો", desc: "પોર્ટલ પર તમારી જરૂરિયાત મુજબની યોજના (ટ્રેક્ટર, પાઇપલાઇન, ગ્રીનહાઉસ કે GAIC) પસંદ કરો.", icon: "🔍" },
                  { step: "02", title: "દસ્તાવેજો તૈયાર રાખો", desc: "જમીનના ૭/૧૨ - ૮-અ ઉતારા, આધાર કાર્ડ, બેંક પાસબુક અને ડીલર ક્વોટેશન સાથે રાખો.", icon: "📑" },
                  { step: "03", title: "ઓનલાઇન અરજી સબમિટ કરો", desc: "i-Khedut અથવા GAIC પર ફોર્મ ભરી પ્રિન્ટ મેળવી સાચવી રાખો.", icon: "💻" },
                  { step: "04", title: "મંજૂરી અને સબસિડી જમા", desc: "અધિકારીની ચકાસણી બાદ સહાય સીધી તમારા બેંક ખાતામાં (DBT) જમા થશે.", icon: "💰" }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border relative flex flex-col justify-between ${
                      isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{s.icon}</span>
                        <span className="text-xs font-black text-green-500 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-md">
                          STEP {s.step}
                        </span>
                      </div>
                      <h4 className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</h4>
                      <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SCHEMES EXPLORER */}
          <section id="schemes-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
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
                  <p className="text-xs text-slate-400">{filteredSchemes.length} {t.schemesFound}</p>
                </div>

                <div className={`flex items-center p-1 rounded-xl gap-1 self-start md:self-auto ${
                  isDark ? 'bg-slate-900' : 'bg-slate-100'
                }`}>
                  {["all", "gujarat", "central"].map((gov) => (
                    <button
                      key={gov}
                      onClick={() => setSelectedGovt(gov)}
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition ${
                        selectedGovt === gov
                          ? (isDark ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-green-800 shadow-xs')
                          : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                      }`}
                    >
                      {gov === "all" ? t.allGovt : gov === "gujarat" ? `🏛️ ${t.gujaratGovt}` : `🇮🇳 ${t.centralGovt}`}
                    </button>
                  ))}
                </div>
              </div>

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

              {(selectedGovt !== "all" || selectedCategory !== "all" || searchTerm) && (
                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                  isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'
                }`}>
                  <span>ફિલ્ટર સક્રિય છે</span>
                  <button onClick={resetAllFilters} className="text-green-500 hover:text-green-400 font-semibold underline">
                    {t.resetFilters}
                  </button>
                </div>
              )}
            </div>

            {filteredSchemes.length === 0 ? (
              <div className={`rounded-2xl p-12 text-center border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="text-4xl mb-3">🔍</div>
                <h4 className="text-lg font-bold">કોઈ યોજના મળી નથી / No schemes match</h4>
                <p className="text-xs text-slate-400 mt-1">કૃપા કરીને અલગ કીવર્ડ શોધો અથવા ફિલ્ટર બદલો.</p>
                <button onClick={resetAllFilters} className="mt-4 text-xs font-semibold bg-green-600 text-white px-4 py-2 rounded-lg">
                  {t.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group ${
                      isDark 
                        ? 'bg-slate-800/90 border-slate-700 hover:border-green-500 hover:shadow-lg' 
                        : 'bg-white border-slate-200 hover:border-green-400 hover:shadow-md'
                    }`}
                  >
                    <div>
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
                                : scheme.govType === "gujarat"
                                  ? "bg-green-50 dark:bg-green-950/60 text-green-900 dark:text-green-300 border-green-300 dark:border-green-800"
                                  : "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                            }`}>
                              {scheme.sourceDept === "gaic" ? "GAIC" : scheme.sourceDept === "ikhedut" ? "i-Khedut" : scheme.sourceDept === "agri_dept" ? "Agri Dept" : "Central"}
                            </span>
                            {scheme.badge_gu && (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                                {lang === "gu" ? scheme.badge_gu : scheme.badge_en}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className={`text-base sm:text-lg font-bold group-hover:text-green-500 transition leading-snug ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {lang === "gu" ? scheme.title_gu : scheme.title_en}
                        </h4>
                        
                        <p className={`text-xs mt-1 font-medium line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {lang === "gu" ? scheme.dept_gu : scheme.dept_en}
                        </p>
                      </div>

                      <div className={`px-5 py-3 border-y ${
                        isDark ? 'bg-slate-900/60 border-slate-700/80 text-emerald-400' : 'bg-green-50/60 border-green-100 text-green-800'
                      }`}>
                        <div className="text-[11px] font-bold uppercase tracking-wide">
                          {t.benefits}:
                        </div>
                        <p className={`text-xs font-semibold mt-0.5 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {lang === "gu" ? scheme.benefit_gu : scheme.benefit_en}
                        </p>
                      </div>

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

                    <div className="p-5 pt-0">
                      <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <button
                          onClick={() => setSelectedScheme(scheme)}
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
                        onClick={() => handleShareWhatsapp(scheme)}
                        className="mt-2 w-full text-[11px] font-medium py-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <span>💬 {t.shareWhatsapp}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* CALCULATOR */}
          <section id="calculator" className={`py-12 px-4 sm:px-6 border-t transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-gradient-to-b from-slate-100 to-white border-slate-200'
          }`}>
            <div className={`max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 border shadow-md transition-colors ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-3xl">🧮</span>
                <h3 className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.calculatorTitle}</h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.calculatorSub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  onClick={handleRunQuiz}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-green-600/20 transition flex items-center justify-center gap-2"
                >
                  <span>{t.checkEligibilityBtn}</span> ➔
                </button>
              </div>
            </div>
          </section>

          {/* HELPLINES */}
          <section id="helplines" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
            <div className={`rounded-3xl p-6 sm:p-10 text-white shadow-xl ${
              isDark ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 border border-green-800' : 'bg-gradient-to-r from-emerald-800 to-green-900'
            }`}>
              <div className="max-w-4xl">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                  ૨૪ x ૭ ખેડૂત માર્ગદર્શન સેવા
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mt-3">{t.helplineTitle}</h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  કોઈપણ યોજના, i-Khedut અરજી, GAIC પ્રોસેસિંગ સબસિડી કે સહાય માટે ટોલ-ફ્રી નંબરો:
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                    <div className="text-xs text-emerald-200 font-medium">{t.kisanCallCenter}</div>
                    <div className="text-lg font-black mt-1 text-white">1800-180-1551</div>
                    <div className="text-[10px] text-emerald-300 mt-1">સવારે ૬ થી રાત્રે ૧૦ (નિઃશુલ્ક)</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                    <div className="text-xs text-emerald-200 font-medium">{t.ikhedutHelp}</div>
                    <div className="text-lg font-black mt-1 text-white">079-23256114</div>
                    <div className="text-[10px] text-emerald-300 mt-1">કૃષિ ભવન, ગાંધીનગર</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                    <div className="text-xs text-emerald-200 font-medium">{t.gaicHelp}</div>
                    <div className="text-lg font-black mt-1 text-white">079-23240208</div>
                    <div className="text-[10px] text-emerald-300 mt-1">GAIC એગ્રો પ્રોસેસિંગ સેલ</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                    <div className="text-xs text-emerald-200 font-medium">{t.ggrcHelp}</div>
                    <div className="text-lg font-black mt-1 text-white">1800-233-2652</div>
                    <div className="text-[10px] text-emerald-300 mt-1">GGRC ટપક સિંચાઈ ટોલ ફ્રી</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DETAIL MODAL */}
          {selectedScheme && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
              }`}>
                <div className="p-6 bg-gradient-to-r from-green-800 to-emerald-800 text-white flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-white/10 p-2.5 rounded-2xl">{selectedScheme.icon}</span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                        {selectedScheme.sourceDept === "gaic" ? "GAIC યોજના" : selectedScheme.govType === "gujarat" ? "ગુજરાત સરકાર માન્ય" : "ભારત સરકાર માન્ય"}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold mt-1 text-white leading-snug">
                        {lang === "gu" ? selectedScheme.title_gu : selectedScheme.title_en}
                      </h3>
                      <p className="text-xs text-amber-200 font-semibold mt-0.5">
                        {lang === "gu" ? selectedScheme.dept_gu : selectedScheme.dept_en}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedScheme(null)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition">
                    ✕
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs sm:text-sm">
                  <div className={`rounded-2xl p-4 border ${
                    isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}>
                    <h5 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide">
                      <span>💰</span> {t.benefits}
                    </h5>
                    <p className={`font-medium mt-1 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {lang === "gu" ? selectedScheme.benefit_gu : selectedScheme.benefit_en}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-400">
                      <span>🎯</span> {t.eligibility}
                    </h5>
                    <p className={`mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {lang === "gu" ? selectedScheme.eligibility_gu : selectedScheme.eligibility_en}
                    </p>
                  </div>

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
                      {(lang === "gu" ? selectedScheme.docs_gu : selectedScheme.docs_en).map((doc, idx) => {
                        const checkKey = `${selectedScheme.id}-${idx}`;
                        const isChecked = !!checkedDocs[checkKey];
                        return (
                          <label
                            key={idx}
                            onClick={() => handleDocCheck(selectedScheme.id, idx)}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                              isChecked
                                ? (isDark ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-emerald-50/80 border-emerald-300 text-emerald-900')
                                : (isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700')
                            }`}
                          >
                            <input type="checkbox" checked={isChecked} readOnly className="mt-0.5 rounded text-green-600 focus:ring-0" />
                            <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'font-medium'}`}>{doc}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 text-xs p-3 rounded-xl border ${
                    isDark ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <span className="text-base">📅</span>
                    <div>
                      <span className="font-bold">{t.deadline}: </span>
                      <span>{lang === "gu" ? selectedScheme.deadline_gu : selectedScheme.deadline_en}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <button
                    onClick={() => handleShareWhatsapp(selectedScheme)}
                    className="w-full sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 transition flex items-center justify-center gap-1.5"
                  >
                    <span>💬 {t.shareWhatsapp}</span>
                  </button>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedScheme(null)}
                      className={`w-1/2 sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      બંધ કરો (Close)
                    </button>
                    <a
                      href={selectedScheme.portalUrl}
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
          )}
            </>
          )}

{/* FOOTER */}
          <footer className={`text-xs py-10 border-t transition-colors mt-auto ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 text-white font-bold text-base mb-2">
                    <YDLogo size="w-10 h-10" />
                    <div>
                      <div className="text-white font-black">{t.portalName}</div>
                      <div className="text-[11px] text-amber-300 font-semibold">
                        Founder: Yash Dadhaniya (Village: Buri)
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mt-2">
                    Created & Developed by <b>Yash Dadhaniya (Village: Buri, Gujarat)</b> to empower farmers with transparent access to i-Khedut, GAIC, and Central government agricultural schemes.
                  </p>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
                    Official Government Portals
                  </h5>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://ikhedut.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition flex items-center gap-1">
                        ➔ i-Khedut Portal (ikhedut.gujarat.gov.in)
                      </a>
                    </li>
                    <li>
                      <a href="https://gaic.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition flex items-center gap-1">
                        ➔ GAIC Agro Industries (gaic.gujarat.gov.in)
                      </a>
                    </li>
                    <li>
                      <a href="https://agri.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition flex items-center gap-1">
                        ➔ Department of Agriculture (agri.gujarat.gov.in)
                      </a>
                    </li>
                    <li>
                      <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition flex items-center gap-1">
                        ➔ PM-Kisan Portal (pmkisan.gov.in)
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
                    Farmer Support & Contact
                  </h5>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    For online application assistance, farmers can visit their nearest Gram Panchayat VCE center.
                  </p>
                  <div className="text-white font-semibold text-xs">
                    Kisan Call Center: 1800-180-1551
                  </div>
                  <div className="mt-2 text-[11px] text-amber-300">
                    Courtesy: Yash Dadhaniya, Village: Buri (Gujarat, India)
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                <p>{t.disclaimer}</p>
                <p>© 2026 Gujarat Khedut Sahay Portal • Yash Dadhaniya (Village: Buri).</p>
              </div>
            </div>
          </footer>

        </div>
      );
    }

    