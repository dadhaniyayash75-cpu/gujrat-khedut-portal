import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract JavaScript block from index.html
script_match = re.search(r'<script type="text/babel">(.*?)</script>', html, re.DOTALL)
if not script_match:
    print("Script not found")
    exit(1)

js_content = script_match.group(1)

# We want to keep everything from the start up to `function AuthModal`
auth_idx = js_content.find('function AuthModal')
app_idx = js_content.find('function App() {')
end_idx = js_content.find('ReactDOM.createRoot')

header_logic = js_content[:auth_idx]
app_logic = js_content[app_idx:end_idx]

# Modify App logic to become Home
# Replace function App() { with export default function Home() {
app_logic = app_logic.replace('function App() {', 'export default function Home() {')

# Remove the routing block (currentPage === 'services' ...) and just return the <> ... </>
routing_start = app_logic.find("{currentPage === 'services' ? (")
routing_end = app_logic.find("</section>\n            )}")

if routing_start != -1 and routing_end != -1:
    # Instead of deleting, just replace the conditional logic to always show the main content
    pass

# To make it a valid Vite React component, we need to add imports
react_imports = """
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
"""

# Let's do a simpler string replacement
# We will inject the button to route to our new pages!
app_logic = app_logic.replace("setCurrentPage('services')", "navigate('/search-services')")
app_logic = app_logic.replace("setCurrentPage('dashboard')", "navigate('/provider-dashboard')")
app_logic = app_logic.replace("setCurrentPage(user.role === 'provider' ? 'dashboard' : 'services')", "navigate(user.role === 'provider' ? '/provider-dashboard' : '/search-services')")

final_jsx = react_imports + "\n" + header_logic + "\n" + app_logic

# Fix React.useContext
final_jsx = final_jsx.replace('export default function Home() {', 'export default function Home() {\n  const { user } = React.useContext(AuthContext);\n  const navigate = useNavigate();')

# Fix state for user (already handled by context)
final_jsx = re.sub(r'const \[user, setUser\] = React\.useState.*?;\n', '', final_jsx)
final_jsx = re.sub(r'const \[currentPage, setCurrentPage\] = React\.useState.*?;\n', '', final_jsx)
final_jsx = re.sub(r'const \[isAuthOpen, setIsAuthOpen\] = React\.useState.*?;\n', '', final_jsx)

# Clean up AuthModal rendering
final_jsx = re.sub(r'<AuthModal[^>]*/>', '', final_jsx)

# Clean up React.useState, etc to not conflict if possible, but they are fine.

with open('client/src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(final_jsx)

print("Home.jsx restored with original UI.")
