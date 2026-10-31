import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Read components from parts
with open("comp_part1.jsx", "r", encoding="utf-8") as f1:
    part1 = f1.read()
with open("comp_part2.jsx", "r", encoding="utf-8") as f2:
    part2 = f2.read()

# 2. Replace everything from AuthModal to App
auth_modal_start = content.find("function AuthModal")
app_start = content.find("function App() {")

if auth_modal_start != -1 and app_start != -1:
    content = content[:auth_modal_start] + part1 + "\n" + part2 + "\n" + content[app_start:]

# 3. Update the Nav buttons inside App
# Find the button rendering block and replace it
nav_button_pattern = r"\{user\s*&&\s*\(user\.role.*?<div className=\"flex items-center gap-2 sm:gap-3\">"

nav_buttons_new = r"""{user && (
                    <button 
                      onClick={() => setCurrentPage(currentPage === "home" ? (user.role === 'provider' ? 'dashboard' : 'services') : "home")}
                      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition border ${currentPage !== 'home' ? 'bg-green-600 text-white border-green-700' : (isDark ? 'bg-green-900/40 text-green-400 border-green-800 hover:bg-green-800' : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100')}`}
                    >
                      🚜 {lang === "gu" ? (currentPage === "home" ? (user.role === 'provider' ? "પ્રોવાઈડર ડેશબોર્ડ" : "સાધનો ભાડે મેળવો") : "હોમ પેજ") : (currentPage === "home" ? (user.role === 'provider' ? "Provider Dashboard" : "Rent Equipment") : "Home")}
                    </button>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3">"""

content = re.sub(nav_button_pattern, nav_buttons_new, content, flags=re.DOTALL)

# 4. Update the Big Banner button for Receiver and Provider
big_banner_pattern = r"(<section className=\"max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full\">.*?)(</section>)"
new_big_banner = r"""<section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full">
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
            </section>"""
content = re.sub(big_banner_pattern, new_big_banner, content, flags=re.DOTALL)

# 5. Update conditional rendering routing in App
routing_pattern = r"\{currentPage === 'services' \? \(.*?\ServiceMarketplace.*?\) : \(\s*<>"
new_routing = r"""{currentPage === 'services' ? (
            <ServiceMarketplace lang={lang} isDark={isDark} user={user} onBack={() => setCurrentPage('home')} />
          ) : currentPage === 'dashboard' ? (
            <ProviderDashboard lang={lang} isDark={isDark} user={user} />
          ) : (
            <>"""
content = re.sub(routing_pattern, new_routing, content, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Full replacement complete!")
