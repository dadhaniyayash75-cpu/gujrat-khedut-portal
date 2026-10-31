import re

with open('client/src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the useEffect that forces login (it was probably for the modal)
content = re.sub(r'useEffect\(\(\) => \{\s*if \(!user\) \{\s*setIsAuthOpen\(true\);\s*\}\s*\}, \[user\]\);', '', content)
content = re.sub(r'setIsAuthOpen\(false\);', '', content)
content = re.sub(r'setIsAuthOpen\(true\)', "navigate('/login')", content)
content = re.sub(r'setCurrentPage\([^\)]+\)', '', content) # any leftovers

with open('client/src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Home.jsx fixed!")
