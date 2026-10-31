import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Modify AuthModal to add Role Selection
auth_modal_pattern = r"(function AuthModal\(\{.*?\)\s*\{)(.*?)(const handleSubmit =)"
auth_modal_replacement = r"""\1\2
      const [role, setRole] = React.useState("taker");
      \3"""
content = re.sub(auth_modal_pattern, auth_modal_replacement, content, flags=re.DOTALL)

village_input_pattern = r"(<div className=\"mb-4\">\s*<label className.*?Village.*?</div>)"
village_input_replacement = r"""\1
                  
                  {mode === "register" && (
                    <div className="mb-5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {lang === "gu" ? "તમે કોણ છો? (Role)" : "Who are you?"}
                      </label>
                      <div className="flex gap-3">
                        <label className={`flex-1 flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${role === 'taker' ? 'bg-green-100 border-green-500 text-green-900' : 'border-slate-200 text-slate-600'} dark:${role === 'taker' ? 'bg-green-900/50 border-green-500 text-green-300' : 'border-slate-600 text-slate-400'}`}>
                          <input type="radio" name="role" value="taker" checked={role === "taker"} onChange={(e)=>setRole(e.target.value)} className="text-green-600 focus:ring-green-500" />
                          <span className="text-xs font-bold">{lang === "gu" ? "ખેડૂત / સેવા લેનાર" : "Farmer (Taker)"}</span>
                        </label>
                        <label className={`flex-1 flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${role === 'provider' ? 'bg-blue-100 border-blue-500 text-blue-900' : 'border-slate-200 text-slate-600'} dark:${role === 'provider' ? 'bg-blue-900/50 border-blue-500 text-blue-300' : 'border-slate-600 text-slate-400'}`}>
                          <input type="radio" name="role" value="provider" checked={role === "provider"} onChange={(e)=>setRole(e.target.value)} className="text-blue-600 focus:ring-blue-500" />
                          <span className="text-xs font-bold">{lang === "gu" ? "સાધનો ભાડે આપનાર" : "Service Provider"}</span>
                        </label>
                      </div>
                    </div>
                  )}
"""
content = re.sub(village_input_pattern, village_input_replacement, content, flags=re.DOTALL)

handle_submit_pattern = r"(localStorage\.setItem\(\"khedut_user\", JSON\.stringify\(\{)(.*?)(\}\)\);)"
handle_submit_replacement = r"\1\2, role: role\3"
content = re.sub(handle_submit_pattern, handle_submit_replacement, content, flags=re.DOTALL)

# 2. Add ServiceMarketplace Component
service_marketplace_component = r"""
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

      const handleSearch = () => {
        if (!village) return alert(lang === "gu" ? "કૃપા કરીને ગામનું નામ દાખલ કરો!" : "Please enter village name!");
        setSearched(true);
      };

      const results = MOCK_PROVIDERS.filter(p => p.service === serviceType && p.distance <= 20);

      return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 ${isDark ? "text-white" : "text-slate-900"}`}>
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
    
    function App() {
"""
content = content.replace("    function App() {", service_marketplace_component)

app_state_pattern = r"(const \[userData, setUserData\] = useState\([^;]*?\);\n)"
app_state_replacement = r"\1      const [currentPage, setCurrentPage] = React.useState('home');\n"
content = re.sub(app_state_pattern, app_state_replacement, content, flags=re.DOTALL)

nav_safe_pattern = r"(\{\s*userData\s*\?\s*\(\s*<div className=\"flex items-center gap-2 sm:gap-3\">)"
nav_safe_replacement = r"""{userData && userData.role === "taker" && (
                    <button 
                      onClick={() => setCurrentPage(currentPage === "home" ? "services" : "home")}
                      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition border ${currentPage === 'services' ? 'bg-green-600 text-white border-green-700' : (isDark ? 'bg-green-900/40 text-green-400 border-green-800 hover:bg-green-800' : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100')}`}
                    >
                      🚜 {lang === "gu" ? (currentPage === "home" ? "સાધનો ભાડે મેળવો" : "હોમ પેજ") : (currentPage === "home" ? "Rent Equipment" : "Home")}
                    </button>
                  )}
                  \1"""
content = re.sub(nav_safe_pattern, nav_safe_replacement, content, flags=re.DOTALL)

main_content_pattern = r"(<main className=\"flex-1 flex flex-col pt-16\">\s*)(<section className=\"w-full.*?bg-gradient-to-r)"
main_content_replacement = r"""\1
          {currentPage === 'services' ? (
            <ServiceMarketplace lang={lang} isDark={isDark} user={userData} onBack={() => setCurrentPage('home')} />
          ) : (
            <>
          \2"""
content = re.sub(main_content_pattern, main_content_replacement, content, flags=re.DOTALL)

footer_pattern = r"(\s*{/\* FOOTER \*/}\s*<footer)"
footer_replacement = r"""
            </>
          )}
\1"""
content = re.sub(footer_pattern, footer_replacement, content, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied.")
