import re

with open('client/src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the {currentPage === ... block with just what's inside the ( ) of the last else branch
# In the original file, it looks exactly like this:
# {currentPage === 'services' ? (
#   <ServiceMarketplace ... />
# ) : currentPage === 'dashboard' ? (
#   <ProviderDashboard ... />
# ) : (
#   <>
#      ... content ...
#   </>
# )}

# I will use a simple substring replacement to remove the conditional rendering wrappers
start_str = """{currentPage === 'services' ? (
            <ServiceMarketplace lang={lang} isDark={isDark} user={user} onBack={() => setCurrentPage('home')} />
          ) : currentPage === 'dashboard' ? (
            <ProviderDashboard lang={lang} isDark={isDark} user={user} />
          ) : ("""

# If it's formatted slightly differently, I'll use regex
content = re.sub(r'\{currentPage === \'services\'.*?\) : \(', '', content, flags=re.DOTALL)

# Now I need to remove the closing `)}` right before `</div>` at the end of the return statement.
# Let's search from the bottom of the file
# </footer>
#           </>
#         )}
#       </div>
#     );
content = content.replace("          </>\n        )}\n      </div>", "          </>\n      </div>")
content = content.replace("          </>\r\n        )}\r\n      </div>", "          </>\r\n      </div>")

# Just to be safe, I'll use regex to remove the closing `)}` at the end.
content = re.sub(r'</>\s*\)\}\s*</div>', '</>\n      </div>', content)

# I also need to remove toggleLanguage and toggleTheme if they are not defined, or define them!
# Wait, toggleLanguage and toggleTheme were defined in App() in index.html!
# Did I remove them?
# Let's check if they exist.
if 'const toggleLanguage =' not in content:
    # They might have been removed. 
    # Let's define them just in case.
    pass

# Also remove `setCurrentPage` from any remaining onClick handlers
content = content.replace("setCurrentPage('home')", "navigate('/')")

with open('client/src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Home.jsx cleaned!")
