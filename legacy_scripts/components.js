function AuthModal({ isOpen, onLoginSuccess, lang, isDark }) {
      const [mode, setMode] = useState("register");
      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const [mobile, setMobile] = useState("");
      const [password, setPassword] = useState("");
      const [village, setVillage] = useState("");
      const [showPassword, setShowPassword] = useState(false);
      const [error, setError] = useState("");

      if (!isOpen) return null;

      const hasMinLength = password.length >= 8;
      const hasNumber = /\d/.test(password);
      const hasSpecialOrUpper = /[!@#$%^&*(),.?":{}|<>]|[A-Z]/.test(password);
      const isPasswordValid = hasMinLength && hasNumber && hasSpecialOrUpper;
      const isMobileValid = /^[6-9]\d{9}$/.test(mobile.trim());
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

      
      const [role, setRole] = React.useState("taker");
      const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (mode === "register") {
          if (!name.trim()) {
            setError(lang === "gu" ? "કૃપા કરીને તમારું પૂરું નામ દાખલ કરો." : "Please enter your full name.");
            return;
          }
          if (!isEmailValid) {
            setError(lang === "gu" ? "કૃપા કરીને સાચો Gmail દાખલ કરો." : "Please enter a valid Gmail address.");
            return;
          }
          if (!isMobileValid) {
            setError(lang === "gu" ? "કૃપા કરીને ૧૦ અંકનો સાચો મોબાઇલ નંબર દાખલ કરો." : "Please enter a valid 10-digit mobile number.");
            return;
          }
          if (!isPasswordValid) {
            setError(lang === "gu" ? "પાસવર્ડ આપેલી તમામ શરતો મુજબ હોવો જોઈએ." : "Password must satisfy all conditions below.");
            return;
          }

          const userData = {
            name: name.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            village: village.trim() || "Buri",
            loggedInAt: new Date().toISOString()
          };

          localStorage.setItem("khedut_user", JSON.stringify(userData));
          onLoginSuccess(userData);
        } else {
          if (!mobile.trim() && !email.trim()) {
            setError(lang === "gu" ? "કૃપા કરીને મોબાઇલ નંબર અથવા Gmail દાખલ કરો." : "Please enter mobile number or Gmail.");
            return;
          }
          if (password.length < 6) {
            setError(lang === "gu" ? "પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ." : "Password must be at least 6 characters.");
            return;
          }

          const saved = localStorage.getItem("khedut_user");
          let userData = saved ? JSON.parse(saved) : null;
          if (!userData) {
            userData = {
              name: email.split("@")[0] || "Farmer Friend",
              email: email.trim(),
              mobile: mobile.trim(),
              village: "Buri",
              loggedInAt: new Date().toISOString()
            };
          }
          localStorage.setItem("khedut_user", JSON.stringify(userData));
          onLoginSuccess(userData);
        }
      };

      return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-3xl max-w-md w-full shadow-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="bg-gradient-to-r from-green-800 via-emerald-800 to-green-700 text-white p-6 text-center relative">
              <div className="flex justify-center mb-3">
                <YDLogo size="w-16 h-16" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {lang === "gu" ? "ગુજરાત ખેડૂત સહાય પોર્ટલ" : "Gujarat Khedut Sahay Portal"}
              </h3>
              <p className="text-xs text-amber-200 font-semibold mt-1">
                Founder: Yash Dadhaniya (Village: Buri)
              </p>
              <p className="text-[11px] text-emerald-100 mt-2">
                {lang === "gu"
                  ? "પોર્ટલની તમામ યોજનાઓ જોવા માટે કૃપા કરીને ખાતું બનાવો અથવા સાઇન ઇન કરો"
                  : "Please register or sign in to explore all government schemes"}
              </p>
            </div>

            <div className={`flex border-b text-xs font-bold ${
              isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
            }`}>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex-1 py-3.5 text-center transition border-b-2 ${
                  mode === "register"
                    ? "border-green-600 text-green-500 bg-slate-800/60 dark:bg-slate-800"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                📝 {lang === "gu" ? "ખાતું બનાવો (Create Account)" : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 py-3.5 text-center transition border-b-2 ${
                  mode === "login"
                    ? "border-green-600 text-green-500 bg-slate-800/60 dark:bg-slate-800"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                🔐 {lang === "gu" ? "સાઇન ઇન (Sign In)" : "Sign In"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium flex items-center gap-2">
                  <span>⚠️</span> <span>{error}</span>
                </div>
              )}

              {mode === "register" && (
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    👤 {lang === "gu" ? "તમારું પૂરું નામ (Full Name) *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === "gu" ? "દા.ત. રમેશભાઈ પટેલ" : "e.g. Ramesh Patel"}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  ✉️ {lang === "gu" ? "જીમેઈલ / ઈમેઈલ (Gmail Address) *" : "Gmail Address *"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  📱 {lang === "gu" ? "મોબાઇલ નંબર (Mobile Number) *" : "Mobile Number *"}
                </label>
                <div className="flex">
                  <span className={`inline-flex items-center px-3 rounded-l-xl border border-r-0 text-xs font-semibold ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}>
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    className={`w-full px-3.5 py-2.5 rounded-r-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {mode === "register" && (
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    🏡 {lang === "gu" ? "ગામનું નામ (Village Name - વૈકલ્પિક)" : "Village Name (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Buri"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    🔒 {lang === "gu" ? "પાસવર્ડ (Password) *" : "Password *"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-green-500 hover:text-green-400"
                  >
                    {showPassword ? "👁️ છુપાવો" : "👁️ બતાવો"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />

                {mode === "register" && (
                  <div className={`mt-2.5 p-3 rounded-xl border text-[11px] space-y-1.5 ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {lang === "gu" ? "પાસવર્ડ શરતો (Password Conditions):" : "Password Requirements:"}
                    </div>
                    
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400 font-semibold" : "text-slate-400"}`}>
                      <span>{hasMinLength ? "✅" : "⚪"}</span>
                      <span>{lang === "gu" ? "ઓછામાં ઓછા ૮ અક્ષર (Min 8 characters)" : "At least 8 characters"}</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400 font-semibold" : "text-slate-400"}`}>
                      <span>{hasNumber ? "✅" : "⚪"}</span>
                      <span>{lang === "gu" ? "ઓછામાં ઓછો ૧ અંક (At least 1 number 0-9)" : "At least 1 number (0-9)"}</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasSpecialOrUpper ? "text-emerald-400 font-semibold" : "text-slate-400"}`}>
                      <span>{hasSpecialOrUpper ? "✅" : "⚪"}</span>
                      <span>{lang === "gu" ? "૧ ખાસ ચિહ્ન અથવા કેપિટલ અક્ષર (@, #, $ કે A-Z)" : "1 special char or capital letter (@,#,$,A-Z)"}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-green-600/20 transition flex items-center justify-center gap-2 mt-4"
              >
                <span>
                  {mode === "register"
                    ? (lang === "gu" ? "ખાતું બનાવી પોર્ટલ ખોલો ➔" : "Create Account & Enter Portal ➔")
                    : (lang === "gu" ? "સાઇન ઇન કરી પોર્ટલ ખોલો ➔" : "Sign In & Enter Portal ➔")}
                </span>
              </button>
            </form>

            <div className={`p-3 border-t text-center text-[11px] ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}>
              🌾 Courtesy: Yash Dadhaniya (Village: Buri) | Gujarat Khedut Sahay
            </div>
          </div>
        </div>
      );
    }

    
    // --- GEN-Z TELEMETRY BAR ---
    function TelemetryBar() {
      return (
        <div className="bg-slate-950 text-emerald-400 text-[10px] font-mono py-1 px-4 flex flex-wrap items-center justify-between border-b border-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> SYSTEM: ONLINE</span>
            <span className="hidden sm:inline">| API: i-Khedut & GAIC (v2.4)</span>
            <span className="hidden md:inline">| PING: 18ms</span>
          </div>
          <div className="flex items-center gap-3 text-emerald-500">
            <span>🔒 AES-256 SECURE</span>
            <span className="hidden sm:inline">👥 ACTIVE: 14,290+</span>
          </div>
        </div>
      );
    }

    // --- USER WATERMARK (BACKGROUND) ---
    function UserWatermark({ user }) {
      if (!user) return null;
      // Generate a huge repeating string of the user's name
      const watermarkText = Array(30).fill(`🛡️ AUTHENTICATED: ${user.name} (${user.village || 'Gujarat'}) • ID #GJ-8X92 •`).join(" ");
      return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03] dark:opacity-[0.06] select-none flex items-center justify-center">
          <div className="w-[200vw] h-[200vh] flex flex-wrap text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest leading-loose transform -rotate-12 whitespace-pre-wrap">
            {watermarkText}
          </div>
        </div>
      );
    }

    // --- MAIN APP ---

    // --- SERVICE MARKETPLACE COMPONENT ---
    function ServiceMarketplace({ lang, isDark, user, onBack }) {
      const [serviceType, setServiceType] = React.useState("tractor");
      const [village, setVillage] = React.useState(user.village || "");
      const [searched, setSearched] = React.useState(false);
      
      const MOCK_PROVIDERS = [
        { id: 1, name: "Ramesh Bhai", service: "tractor", baseVillage: "Buri", distance: 2, phone: "+91 9876543210", price: "₹500 / Hour" },
        { id: 2, name: "Suresh Patel", service: "harvester", baseVillage: "Kalyanpur", distance: 12, phone: "+91 9988776655", price: "₹1200 / Acre" },
        { id: 3, name: "Kishore Agro", service: "tractor", baseVillage: "Mota Buri", distance: 5, phone: "+91 9123456789", price: "₹450 / Hour" },
        { id: 4, name: "Jayesh Transport", service: "transport", baseVillage: "Navagam", distance: 18, phone: "+91 9998887776", price: "₹800 / Trip" },
        { id: 5, name: "Bhavin Patel", service: "harvester", baseVillage: "Buri", distance: 1, phone: "+91 9000000000", price: "₹1100 / Acre" },
      ];

      
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

      const handleSearch = () => {
        if (!village) return alert(lang === "gu" ? "કૃપા કરીને ગામનું નામ દાખલ કરો!" : "Please enter village name!");
        setSearched(true);
      };

      const results = MOCK_PROVIDERS.filter(p => p.service === serviceType && p.distance <= 20);

      return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 ${isDark ? "text-white" : "text-slate-900"}`}>
          <UserWatermark user={user} />
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100 border'}`}>
              ← {lang === "gu" ? "પાછા જાઓ" : "Go Back"}
            </button>
            <h2 className="text-2xl font-extrabold">{lang === "gu" ? "કૃષિ સાધનો ભાડે મેળવો (Service Marketplace)" : "Rent Agri Equipment"}</h2>
          </div>
          
          <div className={`p-6 rounded-3xl border shadow-sm mb-8 ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-4">{lang === "gu" ? "તમારે કઈ સેવાની જરૂર છે?" : "What service do you need?"}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-500">{lang === "gu" ? "સેવાનો પ્રકાર" : "Service Type"}</label>
                <select value={serviceType} onChange={(e)=>setServiceType(e.target.value)} className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                  <option value="tractor">{lang === "gu" ? "ટ્રેક્ટર (Tractor)" : "Tractor"}</option>
                  <option value="harvester">{lang === "gu" ? "હાર્વેસ્ટર (Harvester)" : "Harvester"}</option>
                  <option value="transport">{lang === "gu" ? "પરિવહન (Transport / Loading)" : "Transport"}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-500">{lang === "gu" ? "તમારું ગામ (રેન્જ માટે)" : "Your Village (For Range)"}</label>
                <input type="text" value={village} onChange={(e)=>setVillage(e.target.value)} placeholder="Enter village..." className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
              </div>
              
              <div className="flex items-end">
                <button onClick={handleSearch} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md">
                  {lang === "gu" ? "20km ની અંદર શોધો 🔍" : "Search within 20km 🔍"}
                </button>
              </div>
            </div>
            
            {searched && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-md font-bold mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  {lang === "gu" ? `${village} ની 20km રેન્જમાં મળેલા સેવા આપનાર:` : `Providers within 20km of ${village}:`}
                </h4>
                
                {results.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 border border-dashed rounded-2xl border-slate-300 dark:border-slate-700">
                    {lang === "gu" ? "આ રેન્જમાં કોઈ સેવા આપનાર મળેલ નથી." : "No providers found in this range."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map(r => (
                      <div key={r.id} className={`p-5 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                          <div className="font-bold text-lg">{r.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">📍 {r.baseVillage} ({r.distance} km away)</div>
                          <div className="text-sm font-black text-green-600 dark:text-green-400 mt-2">{r.price}</div>
                        </div>
                        <a href={`tel:${r.phone}`} className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition">
                          <span className="text-xl">📞</span>
                          <span className="text-[10px] font-bold mt-1">Call</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    