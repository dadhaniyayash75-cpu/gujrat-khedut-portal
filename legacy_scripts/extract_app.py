import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('function App()')
end = content.find('ReactDOM.createRoot')

with open('app_comp.js', 'w', encoding='utf-8') as f:
    f.write(content[start:end])
