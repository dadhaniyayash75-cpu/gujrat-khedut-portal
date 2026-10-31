// --- PROVIDER DASHBOARD ---
function ProviderDashboard({ lang, isDark, user }) {
    const [requests, setRequests] = React.useState([]);

    React.useEffect(() => {
        const allRequests = JSON.parse(localStorage.getItem("khedut_requests") || "[]");
        setRequests(allRequests.filter(r => r.providerId === user.id));
    }, [user.id]);

    const handleAction = (reqId, status) => {
        const allRequests = JSON.parse(localStorage.getItem("khedut_requests") || "[]");
        const idx = allRequests.findIndex(r => r.id === reqId);
        if (idx !== -1) {
            allRequests[idx].status = status;
            localStorage.setItem("khedut_requests", JSON.stringify(allRequests));
            setRequests(allRequests.filter(r => r.providerId === user.id));
        }
    };

    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
                🚜 {lang === "gu" ? "સર્વિસ પ્રોવાઈડર ડેશબોર્ડ" : "Provider Dashboard"}
            </h2>

            <div className={`p-6 rounded-3xl border shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div>
                    <h3 className="text-xl font-black mb-1">{user.name}</h3>
                    <p className="text-slate-500 text-sm">📍 {user.village} | 📞 {user.mobile}</p>
                </div>
                <div className="mt-4 sm:mt-0 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm border border-green-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                    Profile Active
                </div>
            </div>

            <h3 className="text-lg font-bold mb-4">🔔 {lang === "gu" ? "સેવાની વિનંતીઓ (Service Requests)" : "Service Requests"}</h3>
            
            {requests.length === 0 ? (
                <div className="text-center p-8 text-slate-500 border border-dashed rounded-2xl border-slate-300 dark:border-slate-700">
                    {lang === "gu" ? "કોઈ નવી વિનંતી નથી." : "No service requests yet."}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map(req => (
                        <div key={req.id} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-lg">{req.service}</div>
                                    <div className="text-xs text-slate-500">From: {req.receiverName} ({req.receiverVillage})</div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {req.status}
                                </span>
                            </div>
                            <div className="text-sm mb-1">📅 {req.date} | ⏰ {req.time}</div>
                            <div className="text-sm mb-4">💬 "{req.message}"</div>
                            <div className="text-sm mb-4">📞 {req.receiverMobile}</div>

                            {req.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleAction(req.id, 'accepted')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition">Accept</button>
                                    <button onClick={() => handleAction(req.id, 'rejected')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-lg transition">Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- RECEIVER REQUESTS ---
function ReceiverRequests({ lang, isDark, user }) {
    const [requests, setRequests] = React.useState([]);

    React.useEffect(() => {
        const allRequests = JSON.parse(localStorage.getItem("khedut_requests") || "[]");
        setRequests(allRequests.filter(r => r.receiverMobile === user.mobile));
    }, [user.mobile]);

    return (
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4">📝 {lang === "gu" ? "મારી વિનંતીઓ (My Requests)" : "My Requests"}</h3>
            {requests.length === 0 ? (
                <div className="text-sm text-slate-500">{lang === "gu" ? "કોઈ વિનંતી નથી." : "No requests yet."}</div>
            ) : (
                <div className="space-y-3">
                    {requests.map(req => (
                        <div key={req.id} className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div>
                                <div className="font-bold">{req.service}</div>
                                <div className="text-xs text-slate-500">Provider ID: {req.providerId} | Date: {req.date}</div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {req.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- SERVICE MARKETPLACE (RECEIVER) ---
function ServiceMarketplace({ lang, isDark, user, onBack }) {
    const [serviceType, setServiceType] = React.useState("");
    const [village, setVillage] = React.useState(user.village || "");
    const [searched, setSearched] = React.useState(false);
    const [results, setResults] = React.useState([]);
    const [showReqModal, setShowReqModal] = React.useState(null);

    const handleSearch = () => {
        if (!serviceType) return alert("Please select a service.");
        if (!village) return alert("Please enter village name!");
        
        const normVillage = normalizeVillageName(village);
        const receiverCoords = VILLAGES_DB[normVillage];
        
        if (!receiverCoords) {
            alert(lang === "gu" ? "ગામનું નામ ડેટાબેઝમાં નથી. કૃપા કરીને સાચો સ્પેલિંગ નાખો (દા.ત. Gondal, Buri)." : "Village not found in database. Please enter a valid village.");
            return;
        }

        const allProviders = JSON.parse(localStorage.getItem("khedut_providers") || "[]");
        
        const matched = [];
        allProviders.forEach(p => {
            if (p.services && p.services.includes(serviceType)) {
                const pVillage = normalizeVillageName(p.village);
                const pCoords = VILLAGES_DB[pVillage];
                if (pCoords) {
                    const dist = calculateDistance(receiverCoords.lat, receiverCoords.lon, pCoords.lat, pCoords.lon);
                    if (dist <= 20) {
                        matched.push({ ...p, distance: dist });
                    }
                }
            }
        });

        matched.sort((a, b) => a.distance - b.distance);
        setResults(matched);
        setSearched(true);
    };

    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100 border'}`}>
                    ← {lang === "gu" ? "પાછા જાઓ" : "Go Back"}
                </button>
                <h2 className="text-2xl font-extrabold">{lang === "gu" ? "કૃષિ સાધનો ભાડે મેળવો" : "Find Farming Service"}</h2>
            </div>
            
            <div className={`p-6 rounded-3xl border shadow-sm ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-xl text-xs font-bold mb-6 flex gap-2">
                    <span>ℹ️</span> 
                    {lang === "gu" ? "સેવાઓ તમારા ગામથી 20 KM ની હદમાં આવતા પ્રોવાઇડર પાસેથી જ મળશે. અંતર ગામના લોકેશન મુજબ ગણાય છે." : "Services are available from providers within 20 KM of your village. Distance is calculated based on village location."}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold mb-2 opacity-80">{lang === "gu" ? "સેવાનો પ્રકાર" : "Select Service"}</label>
                        <select value={serviceType} onChange={(e)=>setServiceType(e.target.value)} className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <option value="">-- Select --</option>
                            {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-2 opacity-80">{lang === "gu" ? "તમારું ગામ" : "Your Village"}</label>
                        <input type="text" value={village} onChange={(e)=>setVillage(e.target.value)} placeholder="e.g. Gondal" className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-green-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} />
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleSearch} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition">
                            {lang === "gu" ? "ઉપલબ્ધ સેવા શોધો" : "Find Available Providers"}
                        </button>
                    </div>
                </div>
                
                {searched && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-md font-bold mb-4">{lang === "gu" ? "પરિણામો (20 KM ની અંદર):" : "Results (Within 20 KM):"}</h4>
                        
                        {results.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 border border-dashed rounded-2xl border-slate-300 dark:border-slate-700">
                                {lang === "gu" ? "તમારા ગામની 20 KM ની રેન્જમાં આ સેવા માટે કોઈ પ્રોવાઇડર મળ્યા નથી." : "No matching service providers found within 20 KM of your village."}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {results.map(r => (
                                    <div key={r.id} className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <div>
                                            <div className="font-black text-lg">{r.name}</div>
                                            <div className="text-sm font-bold text-green-600 dark:text-green-400">{serviceType} Service</div>
                                            <div className="text-xs text-slate-500 mt-1">📍 Village: {r.village} | 📏 Distance: <span className="font-bold text-blue-600 dark:text-blue-400">{r.distance} KM</span></div>
                                            {r.vehicle && <div className="text-xs mt-1">Vehicle: {r.vehicle}</div>}
                                            <div className="text-xs mt-1">Status: {r.availability} {r.rate && `| Rate: ${r.rate}`}</div>
                                        </div>
                                        <button onClick={() => setShowReqModal(r)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-sm whitespace-nowrap">
                                            {lang === "gu" ? "વિનંતી મોકલો" : "Request Service"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <ReceiverRequests lang={lang} isDark={isDark} user={user} />
            </div>

            {showReqModal && (
                <RequestModal p={showReqModal} service={serviceType} user={user} onClose={() => setShowReqModal(null)} lang={lang} isDark={isDark} />
            )}
        </div>
    );
}

function RequestModal({ p, service, user, onClose, lang, isDark }) {
    const [date, setDate] = React.useState("");
    const [time, setTime] = React.useState("");
    const [message, setMessage] = React.useState("");

    const handleSend = () => {
        if(!date || !time) return alert("Date and Time required.");
        const reqs = JSON.parse(localStorage.getItem("khedut_requests") || "[]");
        reqs.push({
            id: "REQ_" + Date.now(),
            providerId: p.id,
            receiverName: user.name,
            receiverMobile: user.mobile,
            receiverVillage: user.village,
            service: service,
            date, time, message,
            status: "pending"
        });
        localStorage.setItem("khedut_requests", JSON.stringify(reqs));
        alert("Request sent successfully!");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-900'}`}>
                <h3 className="font-black text-lg mb-4">Request Service to {p.name}</h3>
                <div className="mb-3">
                    <label className="block text-xs font-bold mb-1">Date</label>
                    <input type="date" value={date} onChange={e=>setDate(e.target.value)} className={`w-full p-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'}`} />
                </div>
                <div className="mb-3">
                    <label className="block text-xs font-bold mb-1">Time</label>
                    <input type="time" value={time} onChange={e=>setTime(e.target.value)} className={`w-full p-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'}`} />
                </div>
                <div className="mb-5">
                    <label className="block text-xs font-bold mb-1">Message</label>
                    <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="I need a tractor for 3 acres..." className={`w-full p-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'}`} rows="3"></textarea>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-xl font-bold text-sm">Cancel</button>
                    <button onClick={handleSend} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md">Send Request</button>
                </div>
            </div>
        </div>
    );
}
