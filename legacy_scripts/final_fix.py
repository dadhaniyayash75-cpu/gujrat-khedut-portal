import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the stray `</> )}` before footer if it exists
stray_pattern = r"\s*</>\s*\)\}\s*(?=\{/\* FOOTER \*/\})"
content = re.sub(stray_pattern, "\n", content)

# 2. Insert the opening conditional before MANDI TICKER
# If it's already there, don't insert it again.
mandi_pattern = r"(\s*{/\* MANDI TICKER \*/})"
if "{currentPage === 'services'" not in content:
    mandi_replacement = r"""
          {currentPage === 'services' ? (
            <ServiceMarketplace lang={lang} isDark={isDark} user={user} onBack={() => setCurrentPage('home')} />
          ) : (
            <>
          \1"""
    content = re.sub(mandi_pattern, mandi_replacement, content, count=1)

# 3. Re-insert the closing conditional just before FOOTER
footer_pattern = r"(\s*{/\* FOOTER \*/})"
# To avoid double insertion if we already fixed it manually or something:
# We just replace the footer pattern with closing tags if the file has the opening tag
if "{currentPage === 'services'" in content and "</>\n          )}\n\n          {/* FOOTER */}" not in content:
    content = re.sub(footer_pattern, r"\n            </>\n          )}\n\1", content, count=1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Final structural fix applied.")
