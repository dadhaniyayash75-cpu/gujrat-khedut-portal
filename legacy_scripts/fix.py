import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add currentPage state
if "const [currentPage, setCurrentPage]" not in content:
    content = content.replace("function App() {", "function App() {\n      const [currentPage, setCurrentPage] = React.useState('home');")

# 2. Fix user={userData} to user={user}
content = content.replace("user={userData}", "user={user}")

# 3. Add the navigation button for Taker if it's missing
nav_pattern = r"(\{\s*user\s*\?\s*\(\s*<div className=\"flex items-center gap-2 sm:gap-3\">)"
if "🚜" not in content:
    nav_replacement = r"""{user && user.role === "taker" && (
                    <button 
                      onClick={() => setCurrentPage(currentPage === "home" ? "services" : "home")}
                      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition border ${currentPage === 'services' ? 'bg-green-600 text-white border-green-700' : (isDark ? 'bg-green-900/40 text-green-400 border-green-800 hover:bg-green-800' : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100')}`}
                    >
                      🚜 {lang === "gu" ? (currentPage === "home" ? "સાધનો ભાડે મેળવો" : "હોમ પેજ") : (currentPage === "home" ? "Rent Equipment" : "Home")}
                    </button>
                  )}
                  \1"""
    content = re.sub(nav_pattern, nav_replacement, content, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixes applied.")
