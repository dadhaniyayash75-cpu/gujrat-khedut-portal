import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('function AuthModal')
end = content.find('function App()')

with open('components.js', 'w', encoding='utf-8') as f:
    f.write(content[start:end])
