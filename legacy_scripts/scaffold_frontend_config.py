import os
import shutil

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

# tailwind.config.js
create_file('client/tailwind.config.js', '''
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
''')

# postcss.config.js
create_file('client/postcss.config.js', '''
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
''')

# src/index.css
create_file('client/src/index.css', '''
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f8fafc;
}

.dark body {
  background-color: #0f172a;
  color: #f8fafc;
}
''')

print("Frontend setup files created.")
