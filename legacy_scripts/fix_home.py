import os
import re

with open('client/src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix duplicates
content = re.sub(r'const \{ useState, useMemo, useEffect \} = React;', 'const { useMemo } = React;', content)

# Remove local user state completely
content = re.sub(r'const \[user, setUser\] = useState\(\(\) => \{[\s\S]*?\}\);', '', content)

# Also remove theme and language local storage calls if they conflict, but they are okay for Home.jsx local state.
# Let's remove currentPage completely.
content = re.sub(r'const \[currentPage, setCurrentPage\] = useState\([\s\S]*?;\n', '', content)
content = re.sub(r'const \[isAuthOpen, setIsAuthOpen\] = useState\([\s\S]*?;\n', '', content)

# Write back
with open('client/src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
