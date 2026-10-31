with open('client/src/pages/Register.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("village: '',", "village: '', district: '',")

district_input = '''
                <div className="mb-4">
                    <label className="block text-xs font-bold mb-1">Village Name</label>
                    <input type="text" name="village" value={formData.village} onChange={handleChange} className="w-full p-3 rounded-xl border" placeholder="e.g. Manavadar" required />
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-bold mb-1">District</label>
                    <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full p-3 rounded-xl border" placeholder="e.g. Junagadh" required />
                </div>
'''

import re
content = re.sub(r'<div className="mb-4">\s*<label className="block text-xs font-bold mb-1">Village Name</label>\s*<input type="text" name="village"[^>]*>\s*</div>', district_input, content)

with open('client/src/pages/Register.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Register.jsx updated!")
