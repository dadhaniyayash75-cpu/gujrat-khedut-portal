import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix the "Rent Equipment" button visibility for existing users (who don't have a role in localStorage yet)
role_pattern = r"(user && user\.role === \"taker\")"
content = re.sub(role_pattern, r"user && (user.role === 'taker' || !user.role)", content)

# 2. Add UserWatermark component and Telemetry Bar
watermark_code = r"""
    // --- GEN-Z TELEMETRY BAR ---
    function TelemetryBar() {
      return (
        <div className="bg-slate-950 text-emerald-400 text-[10px] font-mono py-1 px-4 flex flex-wrap items-center justify-between border-b border-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> SYSTEM: ONLINE</span>
            <span className="hidden sm:inline">| API: i-Khedut & GAIC (v2.4)</span>
            <span className="hidden md:inline">| PING: 18ms</span>
          </div>
          <div className="flex items-center gap-3 text-emerald-500">
            <span>🔒 AES-256 SECURE</span>
            <span className="hidden sm:inline">👥 ACTIVE: 14,290+</span>
          </div>
        </div>
      );
    }

    // --- USER WATERMARK (BACKGROUND) ---
    function UserWatermark({ user }) {
      if (!user) return null;
      // Generate a huge repeating string of the user's name
      const watermarkText = Array(30).fill(`🛡️ AUTHENTICATED: ${user.name} (${user.village || 'Gujarat'}) • ID #GJ-8X92 •`).join(" ");
      return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03] dark:opacity-[0.06] select-none flex items-center justify-center">
          <div className="w-[200vw] h-[200vh] flex flex-wrap text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest leading-loose transform -rotate-12 whitespace-pre-wrap">
            {watermarkText}
          </div>
        </div>
      );
    }
"""

if "function TelemetryBar" not in content:
    content = content.replace("// --- MAIN APP ---", watermark_code + "\n    // --- MAIN APP ---")

# 3. Insert TelemetryBar at the very top of the app (inside min-h-screen)
telemetry_insert_pattern = r"(<div className={`min-h-screen.*?`}>)"
if "TelemetryBar />" not in content:
    content = re.sub(telemetry_insert_pattern, r"\1\n          <TelemetryBar />", content, count=1)

# 4. Insert UserWatermark inside ServiceMarketplace (so it shows in background of another page)
marketplace_start = r"(<div className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1.*?`}>)"
if "UserWatermark user=" not in content:
    content = re.sub(marketplace_start, r"\1\n          <UserWatermark user={user} />", content, count=1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Gen-Z UI and Watermark additions applied successfully!")
