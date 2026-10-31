const SERVICES_LIST = [
    "Tractor", "Harvester", "Rotavator", "Cultivator", "Seed Drill", 
    "Tractor Trolley", "Water Tanker", "Agricultural Transport", 
    "Goods/Farm Transport", "Sprayer", "Thresher", "Other Farming Equipment", "Other Vehicle Services"
];

const VILLAGES_DB = {
    "gondal": { lat: 21.9619, lon: 70.7923 },
    "jetpur": { lat: 21.7551, lon: 70.6219 },
    "rajkot": { lat: 22.3039, lon: 70.8022 },
    "buri": { lat: 22.0, lon: 70.7 },
    "navagam": { lat: 21.98, lon: 70.75 },
    "kalyanpur": { lat: 22.1, lon: 70.65 },
    "morbi": { lat: 22.812, lon: 70.832 },
    "surat": { lat: 21.1702, lon: 72.8311 },
    "ahmedabad": { lat: 23.0225, lon: 72.5714 },
    "vadodara": { lat: 22.3072, lon: 73.1812 }
};

function normalizeVillageName(name) {
    return name ? name.trim().toLowerCase().replace(/[^a-z]/g, '') : '';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
}

// --- AUTH MODAL ---
function AuthModal({ isOpen, onLoginSuccess, lang, isDark }) {
    const [mode, setMode] = React.useState("register");
    const [role, setRole] = React.useState("receiver");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [mobile, setMobile] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [village, setVillage] = React.useState("");
    const [providerServices, setProviderServices] = React.useState([]);
    const [vehicleDetails, setVehicleDetails] = React.useState("");
    const [rate, setRate] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState("");

    if (!isOpen) return null;

    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialOrUpper = /[!@#$%^&*(),.?":{}|<>]|[A-Z]/.test(password);
    const isPasswordValid = hasMinLength && hasNumber && hasSpecialOrUpper;
    const isMobileValid = /^[6-9]\d{9}$/.test(mobile.trim());
    const isEmailValid = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const toggleService = (srv) => {
        setProviderServices(prev => prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (mode === "register") {
            if (!name.trim() || !mobile.trim() || !village.trim() || !password) {
                setError(lang === "gu" ? "કૃપા કરીને બધી જરૂરી માહિતી ભરો." : "Please fill all required fields.");
                return;
            }
            if (!isMobileValid) {
                setError(lang === "gu" ? "માન્ય 10-આંકડાનો મોબાઈલ નંબર નાખો." : "Enter a valid 10-digit mobile number.");
                return;
            }
            if (!isPasswordValid) {
                setError(lang === "gu" ? "પાસવર્ડની શરતો પૂરી કરો." : "Password does not meet requirements.");
                return;
            }
            const normVillage = normalizeVillageName(village);
            if (!VILLAGES_DB[normVillage]) {
                setError(lang === "gu" ? "ગામનું નામ ડેટાબેઝમાં નથી. કૃપા કરીને સાચો સ્પેલિંગ નાખો (દા.ત. Gondal, Buri)." : "Village not found in database. Please enter valid village.");
                return;
            }

            if (role === "provider" && providerServices.length === 0) {
                setError(lang === "gu" ? "કૃપા કરીને ઓછામાં ઓછી એક સેવા પસંદ કરો." : "Please select at least one service.");
                return;
            }

            const userData = {
                id: "USR_" + Date.now(),
                name: name.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                village: village.trim(),
                role: role
            };

            if (role === "provider") {
                const providers = JSON.parse(localStorage.getItem("khedut_providers") || "[]");
                providers.push({
                    ...userData,
                    services: providerServices,
                    vehicle: vehicleDetails,
                    rate: rate,
                    availability: "Available",
                    description: ""
                });
                localStorage.setItem("khedut_providers", JSON.stringify(providers));
            }

            localStorage.setItem("khedut_user", JSON.stringify(userData));
            onLoginSuccess(userData);
        } else {
            if (!mobile.trim() && !email.trim()) {
                setError(lang === "gu" ? "મોબાઈલ નંબર અથવા ઈમેલ નાખો." : "Enter Mobile or Email.");
                return;
            }
            const saved = localStorage.getItem("khedut_user");
            let userData = saved ? JSON.parse(saved) : null;
            if (!userData) {
                userData = {
                    id: "USR_" + Date.now(),
                    name: "Demo User",
                    mobile: mobile.trim(),
                    village: "gondal",
                    role: "receiver" // fallback
                };
            }
            if(!userData.role) userData.role = "receiver";
            localStorage.setItem("khedut_user", JSON.stringify(userData));
            onLoginSuccess(userData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className={`w-full max-w-md my-8 rounded-3xl shadow-2xl overflow-hidden relative ${isDark ? 'bg-slate-900 text-white border border-slate-700' : 'bg-white text-slate-900'}`}>
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-green-600"></div>
                <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-black mb-1">
                        {mode === "register" ? (lang === "gu" ? "નવું ખાતું બનાવો" : "Create Account") : (lang === "gu" ? "લૉગિન કરો" : "Login")}
                    </h2>
                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {lang === "gu" ? "ગુજરાત ખેડૂત સહાય પોર્ટલ" : "Gujarat Khedut Sahay Portal"}
                    </p>

                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {mode === "register" && (
                            <div className="mb-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                <label className="block text-xs font-bold mb-3">{lang === "gu" ? "તમે કોણ છો? (Role)" : "Choose User Type:"}</label>
                                <div className="flex gap-3">
                                    <label className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition ${role === 'receiver' ? 'bg-green-100 border-green-500 text-green-900' : 'border-slate-200 text-slate-600'} dark:${role === 'receiver' ? 'bg-green-900/50 border-green-500 text-green-300' : 'border-slate-600 text-slate-400'}`}>
                                        <input type="radio" name="role" value="receiver" checked={role === "receiver"} onChange={(e)=>setRole(e.target.value)} className="hidden" />
                                        <span className="text-xl">🌾</span>
                                        <span className="text-xs font-bold text-center">{lang === "gu" ? "ખેડૂત / સેવા લેનાર" : "Service Receiver"}</span>
                                    </label>
                                    <label className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition ${role === 'provider' ? 'bg-blue-100 border-blue-500 text-blue-900' : 'border-slate-200 text-slate-600'} dark:${role === 'provider' ? 'bg-blue-900/50 border-blue-500 text-blue-300' : 'border-slate-600 text-slate-400'}`}>
                                        <input type="radio" name="role" value="provider" checked={role === "provider"} onChange={(e)=>setRole(e.target.value)} className="hidden" />
                                        <span className="text-xl">🚜</span>
                                        <span className="text-xs font-bold text-center">{lang === "gu" ? "સાધનો ભાડે આપનાર" : "Service Provider"}</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {mode === "register" && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold mb-1.5 opacity-80">{lang === "gu" ? "પૂરું નામ (Full Name) *" : "Full Name *"}</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full p-2.5 rounded-xl border text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="Ramesh Patel" />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-xs font-bold mb-1.5 opacity-80">{lang === "gu" ? "મોબાઈલ નંબર *" : "Mobile Number *"}</label>
                            <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>+91</span>
                                <input type="tel" maxLength="10" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} className={`w-full pl-11 pr-3 py-2.5 rounded-xl border text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} ${mobile && !isMobileValid ? 'border-red-500' : ''}`} placeholder="9876543210" />
                            </div>
                        </div>

                        {mode === "register" && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold mb-1.5 opacity-80">{lang === "gu" ? "ગામનું નામ (Village) *" : "Village Name *"}</label>
                                <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} className={`w-full p-2.5 rounded-xl border text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="e.g. Gondal" />
                                <p className="text-[10px] opacity-70 mt-1">{lang === "gu" ? "અંતર શોધવા માટે ગામનું નામ ખૂબ જરૂરી છે." : "Village is VERY IMPORTANT to calculate the 20km service range."}</p>
                            </div>
                        )}

                        {mode === "register" && role === "provider" && (
                            <div className="mb-5 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-3">{lang === "gu" ? "તમે કઈ સેવાઓ આપો છો? *" : "Select Services you provide *"}</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {SERVICES_LIST.map(srv => (
                                        <button type="button" key={srv} onClick={() => toggleService(srv)} className={`px-2 py-1 text-[10px] font-bold rounded-md border transition ${providerServices.includes(srv) ? 'bg-blue-600 text-white border-blue-700' : (isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-600')}`}>
                                            {srv}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="mb-3">
                                    <label className="block text-[10px] font-bold mb-1 opacity-80">{lang === "gu" ? "સાધન/વાહનની વિગત" : "Vehicle/Equipment Details"}</label>
                                    <input type="text" value={vehicleDetails} onChange={e=>setVehicleDetails(e.target.value)} className={`w-full p-2 rounded-lg border text-xs outline-none ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} placeholder="Mahindra 575 DI" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold mb-1 opacity-80">{lang === "gu" ? "અંદાજિત કિંમત (વૈકલ્પિક)" : "Optional Price/Rate"}</label>
                                    <input type="text" value={rate} onChange={e=>setRate(e.target.value)} className={`w-full p-2 rounded-lg border text-xs outline-none ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} placeholder="₹500 / hr" />
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-xs font-bold mb-1.5 opacity-80">{lang === "gu" ? "પાસવર્ડ *" : "Password *"}</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-2.5 pr-10 rounded-xl border text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition">
                            {mode === "register" ? (lang === "gu" ? "ખાતું બનાવો" : "Register") : (lang === "gu" ? "લૉગિન" : "Login")}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs font-semibold">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            {mode === "register" ? (lang === "gu" ? "પહેલેથી ખાતું છે?" : "Already have an account?") : (lang === "gu" ? "ખાતું નથી?" : "Don't have an account?")}
                        </span>
                        <button onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }} className="ml-2 text-green-600 dark:text-green-400 hover:underline">
                            {mode === "register" ? (lang === "gu" ? "અહીં લૉગિન કરો" : "Login here") : (lang === "gu" ? "નવું બનાવો" : "Create one")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
