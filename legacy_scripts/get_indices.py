import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

print('AuthModal index:', content.find('function AuthModal'))
print('ServiceMarketplace index:', content.find('function ServiceMarketplace'))
print('App index:', content.find('function App'))
