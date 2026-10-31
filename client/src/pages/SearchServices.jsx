import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getWhatsAppUrl, getTelUrl, handleCallClick, getFormattedPhoneNumber } from '../utils/phoneUtils';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const takerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const providerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper component to recenter map
function MapRecenter({ center, zoom = 10 }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, zoom, { animate: true });
        }
    }, [center, zoom, map]);
    return null;
}

export default function SearchServices() {
    const { user } = useContext(AuthContext);
    
    const [serviceType, setServiceType] = useState('All');
    const [village, setVillage] = useState(user?.village || '');
    const [district, setDistrict] = useState(user?.district || '');
    const [radius, setRadius] = useState(30);
    
    const [results, setResults] = useState([]);
    const [searchLocation, setSearchLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [mapZoom, setMapZoom] = useState(10);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [requests, setRequests] = useState([]);
    const [copyNotification, setCopyNotification] = useState(null);

    // Modal state for sending custom message & booking request
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [requestForm, setRequestForm] = useState({
        service: '',
        date: new Date().toISOString().split('T')[0],
        time: 'સવાર (Morning)',
        message: 'ખેતીકામ માટે આપની સર્વિસની જરૂર છે.'
    });
    const [sendingRequest, setSendingRequest] = useState(false);
    const [sentConfirmation, setSentConfirmation] = useState(null);

    const mapSectionRef = useRef(null);

    const SERVICES_LIST = ["All", "Tractor", "Harvester", "Rotavator", "Cultivator", "Seed Drill", "Water Tanker", "Agricultural Transport", "Other"];

    const fetchMyRequests = async () => {
        try {
            const reqRes = await api.get('/bookings/my');
            setRequests(reqRes.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const handleSearch = async (overrideRadius) => {
        if (!village) return alert('કૃપા કરીને ગામનું નામ દાખલ કરો (Please enter village name)');
        
        const effectiveRadius = overrideRadius !== undefined ? Number(overrideRadius) : Number(radius);
        if (overrideRadius !== undefined) {
            setRadius(overrideRadius);
        }

        setLoading(true);
        setErrorMsg('');
        setSearched(false);
        setResults([]);
        
        try {
            const res = await api.post('/services/search', {
                service: serviceType,
                village,
                district,
                radiusKm: effectiveRadius
            });
            
            if (res.data.success) {
                setResults(res.data.providers || []);
                const loc = res.data.searchLocation;
                setSearchLocation(loc);
                if (loc && loc.latitude && loc.longitude) {
                    setMapCenter([loc.latitude, loc.longitude]);
                    setMapZoom(10);
                }
                setSearched(true);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'ગામનું લોકેશન મળ્યું નથી અથવા સર્વિસ શોધવામાં સમસ્યા આવી છે.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOnMap = (provider) => {
        if (provider.location && provider.location.coordinates?.length === 2) {
            const lat = provider.location.coordinates[1];
            const lon = provider.location.coordinates[0];
            setMapCenter([lat, lon]);
            setMapZoom(14);
            if (mapSectionRef.current) {
                mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const handleCallWithFeedback = (e, mobile, name) => {
        handleCallClick(e, mobile, name);
        setCopyNotification(`કૉલ નંબર: ${getFormattedPhoneNumber(mobile)} (તમારા ફોન અથવા ક્લિપબોર્ડ પર ઉપલબ્ધ)`);
        setTimeout(() => setCopyNotification(null), 4000);
    };

    const openRequestModal = (provider) => {
        const defaultSrv = provider.services?.[0] || (serviceType !== 'All' ? serviceType : 'Tractor');
        setSelectedProvider(provider);
        setRequestForm({
            service: defaultSrv,
            date: new Date().toISOString().split('T')[0],
            time: 'સવાર (Morning)',
            message: `નમસ્તે ${provider.fullName}, મને ${defaultSrv} સર્વિસ માટે આપની જરૂર છે.`
        });
    };

    const submitRequest = async (e) => {
        e.preventDefault();
        if (!selectedProvider) return;

        setSendingRequest(true);
        try {
            const res = await api.post('/bookings', {
                providerId: selectedProvider._id,
                service: requestForm.service,
                date: requestForm.date,
                time: requestForm.time,
                message: requestForm.message
            });

            if (res.data.success) {
                // Compose WhatsApp text with clean details
                const waMessage = 
                    `🚜 *ગુજરાત ખેડૂત પોર્ટલ - સર્વિસ વિનંતી*\n\n` +
                    `નમસ્તે *${selectedProvider.fullName}*,\n` +
                    `મારું નામ *${user?.fullName || 'ખેડૂત'}* છે.\n` +
                    `મને તમારી *${requestForm.service}* સર્વિસની જરૂર છે.\n\n` +
                    `📍 મારું ગામ: ${user?.village || village}\n` +
                    `📅 તારીખ: ${requestForm.date} (${requestForm.time})\n` +
                    `💬 સંદેશો: ${requestForm.message}\n` +
                    `📞 મારો મોબાઈલ: ${user?.mobile || 'N/A'}\n\n` +
                    `કૃપા કરીને પોર્ટલ પર સ્વીકારો અથવા આ નંબર પર સંપર્ક કરો. આભાર!`;

                const waDirectUrl = getWhatsAppUrl(selectedProvider.mobile, waMessage);

                setSentConfirmation({
                    bookingId: res.data.data?._id,
                    provider: selectedProvider,
                    service: requestForm.service,
                    date: requestForm.date,
                    message: requestForm.message,
                    whatsappUrl: waDirectUrl
                });

                setSelectedProvider(null);
                fetchMyRequests();
            }
        } catch (err) {
            console.error('Request failed:', err);
            alert(err.response?.data?.message || 'Failed to send request. Please ensure you are logged in.');
        } finally {
            setSendingRequest(false);
        }
    };

    const handleUseGps = () => {
        if (!navigator.geolocation) {
            return alert('GPS is not supported by your browser');
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await api.post('/services/search', {
                        service: serviceType,
                        latitude,
                        longitude,
                        radiusKm: radius
                    });
                    if (res.data.success) {
                        setResults(res.data.providers || []);
                        const loc = res.data.searchLocation;
                        setSearchLocation(loc);
                        setMapCenter([latitude, longitude]);
                        setMapZoom(11);
                        setSearched(true);
                    }
                } catch (err) {
                    alert('GPS Search error');
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setLoading(false);
                alert('GPS permission was denied. Please enter village name manually.');
            }
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <h2 className="text-3xl font-black mb-6 text-slate-800">🚜 Search Farming Services (સેવાઓ શોધો)</h2>

            {/* Quick clipboard notification */}
            {copyNotification && (
                <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 border border-slate-700 animate-bounce">
                    <span>📞</span> {copyNotification}
                </div>
            )}
            
            {/* SEARCH FORM */}
            <form 
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end"
            >
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Service Type (જરૂરી સેવા)</label>
                    <select 
                        value={serviceType} 
                        onChange={e => setServiceType(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Village Name (તમારું ગામ)</label>
                    <input 
                        type="text" 
                        value={village} 
                        onChange={e => setVillage(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500" 
                        placeholder="e.g. Manavadar" 
                        required
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">District (જિલ્લો - વૈકલ્પિક)</label>
                    <input 
                        type="text" 
                        value={district} 
                        onChange={e => setDistrict(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500" 
                        placeholder="e.g. Junagadh" 
                    />
                </div>
                <div className="w-[130px]">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Radius (અંતર)</label>
                    <select 
                        value={radius} 
                        onChange={e => setRadius(Number(e.target.value))} 
                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="10">10 KM</option>
                        <option value="20">20 KM</option>
                        <option value="25">25 KM</option>
                        <option value="30">30 KM</option>
                        <option value="40">40 KM</option>
                        <option value="50">50 KM</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-green-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition shadow-md shadow-green-600/20 text-sm flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>શોધી રહ્યું છે...</span>
                            </>
                        ) : (
                            <>
                                <span>🔍 Search</span>
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleUseGps}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3.5 rounded-xl transition shadow-md shadow-blue-600/20 text-sm flex items-center gap-1.5"
                        title="Use my current device GPS coordinates"
                    >
                        <span>📡 Use GPS</span>
                    </button>
                </div>
            </form>

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 font-bold flex items-center gap-2">
                    <span>⚠️</span> {errorMsg}
                </div>
            )}

            {/* Sent Confirmation Modal / Banner */}
            {sentConfirmation && (
                <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-3xl mb-8 shadow-md">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <span className="bg-emerald-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full">
                                ✓ Request Saved & Sent (વિનંતી સફળતાપૂર્વક મોકલાઈ)
                            </span>
                            <h3 className="text-2xl font-black text-slate-800 mt-2">
                                Request sent to {sentConfirmation.provider.fullName}!
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">
                                તમારી સર્વિસ વિનંતી સફળતાપૂર્વક મોકલાઈ ગઈ છે. હવે તમે લાઇવ ટ્રેકિંગ સ્ટેટસ જોઈ શકો છો અથવા WhatsApp પર મેસેજ મોકલી શકો છો:
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sentConfirmation.bookingId && (
                                <Link
                                    to={`/track/${sentConfirmation.bookingId}`}
                                    className="bg-green-700 hover:bg-green-800 text-white font-black px-5 py-3 rounded-xl text-sm transition inline-flex items-center gap-2 shadow-md shadow-green-700/20"
                                >
                                    <span>📍 Live Track Status ➔</span>
                                </Link>
                            )}
                            {sentConfirmation.whatsappUrl && (
                                <a
                                    href={sentConfirmation.whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 rounded-xl text-sm transition inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                                >
                                    <span>📲 Send WhatsApp</span>
                                </a>
                            )}
                            {sentConfirmation.provider.mobile && (
                                <a
                                    href={getTelUrl(sentConfirmation.provider.mobile)}
                                    onClick={(e) => handleCallWithFeedback(e, sentConfirmation.provider.mobile, sentConfirmation.provider.fullName)}
                                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-3 rounded-xl text-sm transition inline-flex items-center gap-1.5"
                                >
                                    <span>📞 Call</span>
                                </a>
                            )}
                            <button
                                onClick={() => setSentConfirmation(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-3 rounded-xl text-sm transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {searched && searchLocation && (
                <div className="mb-6 bg-blue-50 text-blue-900 p-4 rounded-2xl border border-blue-200 flex flex-wrap justify-between items-center gap-3">
                    <div>
                        <p className="font-bold text-base">
                            📍 Searching around: {searchLocation.village} {district ? `, ${district}` : ''} (ગુજરાત)
                        </p>
                        <p className="text-xs text-blue-700 mt-0.5">
                            {radius} KM ત્રિજ્યામાં <b>{results.length}</b> સર્વિસ પ્રોવાઈડર્સ મળ્યા.
                        </p>
                    </div>
                    <span className="bg-blue-200/60 text-blue-900 text-xs font-black px-3 py-1.5 rounded-full">
                        {serviceType} Service
                    </span>
                </div>
            )}

            {searched && (
                <div className="flex flex-col lg:flex-row gap-6 mb-12">
                    {/* RESULTS LIST */}
                    <div className="lg:w-1/2 flex flex-col gap-4">
                        {results.length === 0 ? (
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
                                <div className="text-4xl mb-2">🚜</div>
                                <h3 className="font-bold text-lg mb-1 text-slate-800">No providers found</h3>
                                <p className="text-slate-500 text-sm mb-4">
                                    {village} થી {radius} KM ની અંદર કોઈ {serviceType !== 'All' ? serviceType : ''} સર્વિસ પ્રોવાઈડર મળ્યા નથી.
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button 
                                        onClick={() => handleSearch(40)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-300"
                                    >
                                        🔍 Search within 40 KM
                                    </button>
                                    <button 
                                        onClick={() => handleSearch(50)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-300"
                                    >
                                        🔍 Search within 50 KM
                                    </button>
                                </div>
                            </div>
                        ) : (
                            results.map(r => {
                                const defaultSrv = r.services?.[0] || (serviceType !== 'All' ? serviceType : 'Tractor');
                                const directWaMsg = `નમસ્તે ${r.fullName}, મને ગુજરાત ખેડૂત પોર્ટલ પરથી આપની ${defaultSrv} સર્વિસની માહિતી મળી છે. મારે આપની સર્વિસની જરૂર છે.`;
                                const waUrl = getWhatsAppUrl(r.mobile, directWaMsg);
                                const telUrl = getTelUrl(r.mobile);

                                return (
                                    <div key={r._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 transition hover:shadow-md">
                                        <div className="flex justify-between items-start gap-3">
                                            <div>
                                                <h4 className="font-black text-xl text-slate-800">{r.fullName}</h4>
                                                <p className="text-xs font-bold text-green-700 mt-0.5">✓ Verified Service Provider</p>
                                                <p className="text-xs text-slate-500 mt-1">📍 {r.village}{r.district ? `, ${r.district}` : ''}</p>
                                                <p className="text-xs text-slate-600 font-mono mt-0.5 font-bold">
                                                    📞 {getFormattedPhoneNumber(r.mobile)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-amber-100 text-amber-900 font-black px-3 py-1 rounded-xl text-xs inline-block">
                                                    {r.distanceKm ? `${r.distanceKm.toFixed(1)} KM away` : 'Near'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 space-y-1 border border-slate-100">
                                            <p><b>Services:</b> {r.services?.join(', ') || 'General'}</p>
                                            {r.vehicle && <p><b>Vehicle:</b> {r.vehicle}</p>}
                                            {r.rate && <p><b>Rate:</b> {r.rate}</p>}
                                        </div>

                                        {/* Action buttons: Request, WhatsApp, Call, View on Map */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-100">
                                            <button 
                                                onClick={() => openRequestModal(r)} 
                                                className="col-span-2 sm:col-span-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm"
                                                title="પોટર્લ પર વિનંતી મોકલો"
                                            >
                                                <span>💬 Request</span>
                                            </button>

                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm"
                                                title="સીધા વોટ્સએપ પર મેસેજ કરો"
                                            >
                                                <span>📲 WhatsApp</span>
                                            </a>

                                            <a
                                                href={telUrl}
                                                onClick={(e) => handleCallWithFeedback(e, r.mobile, r.fullName)}
                                                className="bg-slate-800 hover:bg-slate-900 text-white py-2 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm"
                                                title={`Call ${getFormattedPhoneNumber(r.mobile)}`}
                                            >
                                                <span>📞 Call</span>
                                            </a>

                                            <button 
                                                onClick={() => handleViewOnMap(r)}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-2 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1"
                                                title="મેપ પર લોકેશન જુઓ"
                                            >
                                                <span>📍 Map</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* MAP */}
                    <div ref={mapSectionRef} className="lg:w-1/2 h-[520px] bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden relative z-0 shadow-sm">
                        {searchLocation && (
                            <MapContainer 
                                center={mapCenter || [searchLocation.latitude, searchLocation.longitude]} 
                                zoom={mapZoom} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                
                                <MapRecenter center={mapCenter || [searchLocation.latitude, searchLocation.longitude]} zoom={mapZoom} />

                                {/* Taker Location Marker */}
                                <Marker position={[searchLocation.latitude, searchLocation.longitude]} icon={takerIcon}>
                                    <Popup>
                                        <div className="font-bold text-center p-1">
                                            <p className="text-red-600 font-black">📍 તમારું લોકેશન</p>
                                            <p className="text-xs">{searchLocation.village}</p>
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* Provider Markers */}
                                {results.map(r => (
                                    r.location && r.location.coordinates?.length === 2 ? (
                                        <Marker 
                                            key={r._id} 
                                            position={[r.location.coordinates[1], r.location.coordinates[0]]}
                                            icon={providerIcon}
                                        >
                                            <Popup>
                                                <div className="p-1 min-w-[180px]">
                                                    <h3 className="font-black text-sm text-slate-900">{r.fullName}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">📍 {r.village}</p>
                                                    <p className="text-xs font-bold text-blue-600 mt-0.5">🚜 {r.services?.join(', ')}</p>
                                                    <p className="text-xs font-black text-amber-700 mt-0.5">{r.distanceKm?.toFixed(1)} KM away</p>
                                                    <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">📞 {getFormattedPhoneNumber(r.mobile)}</p>

                                                    <div className="mt-2.5 flex flex-col gap-1.5">
                                                        <button 
                                                            onClick={() => openRequestModal(r)}
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-2 rounded-lg transition"
                                                        >
                                                            💬 Request Service
                                                        </button>
                                                        <div className="flex gap-1">
                                                            <a 
                                                                href={getWhatsAppUrl(r.mobile, `નમસ્તે ${r.fullName}, મને ગુજરાત ખેડૂત પોર્ટલ પરથી આપની ${r.services?.[0] || 'ખેતી'} સર્વિસની માહિતી મળી છે.`)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-1 rounded-md text-center transition"
                                                            >
                                                                📲 WhatsApp
                                                            </a>
                                                            <a 
                                                                href={getTelUrl(r.mobile)}
                                                                onClick={(e) => handleCallWithFeedback(e, r.mobile, r.fullName)}
                                                                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold py-1 px-1 rounded-md text-center transition"
                                                            >
                                                                📞 Call
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ) : null
                                ))}
                            </MapContainer>
                        )}
                        {!searchLocation && (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-bold p-6 text-center">
                                <span className="text-4xl mb-2">🗺️</span>
                                <p>ગામનું નામ લખીને સર્ચ કરશો એટલે લાઈવ મેપ અહીં દેખાશે</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MY SENT REQUESTS SECTION */}
            <div className="mt-12">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">My Sent Requests & Messages</h3>
                        <p className="text-xs text-slate-500">તમે સર્વિસ પ્રોવાઈડર્સને મોકલેલી વિનંતીઓ અને સંદેશાઓ</p>
                    </div>
                    <button 
                        onClick={fetchMyRequests} 
                        className="text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition"
                    >
                        🔄 Refresh List
                    </button>
                </div>

                {requests.length === 0 ? (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 text-slate-500 text-sm">
                        હજુ સુધી તમે કોઈ વિનંતી મોકલેલ નથી.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {requests.map(req => {
                            const provider = req.providerId || {};
                            const followUpWaMsg = `નમસ્તે ${provider.fullName || 'પ્રોવાઈડર'}, મેં ગુજરાત ખેડૂત પોર્ટલ પરથી ${req.service} માટે આપને તારીખ ${req.date} ની વિનંતી મોકલેલ છે.`;
                            const waUrl = getWhatsAppUrl(provider.mobile, followUpWaMsg);
                            const telUrl = getTelUrl(provider.mobile);

                            return (
                                <div key={req._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-lg text-slate-800">🚜 {req.service}</span>
                                            <span className={`font-black text-xs uppercase px-3 py-1 rounded-full ${
                                                req.status === 'accepted' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                req.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                'bg-amber-100 text-amber-800 border border-amber-200'
                                            }`}>
                                                ● {req.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 font-semibold">
                                            Provider: {provider.fullName || 'Unknown'} ({provider.village || 'N/A'})
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">📅 Date: {req.date} {req.time ? `(${req.time})` : ''}</p>
                                        {req.message && (
                                            <p className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 mt-2 italic">
                                                💬 "{req.message}"
                                            </p>
                                        )}
                                    </div>

                                    {provider.mobile && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1"
                                                title="WhatsApp કરો"
                                            >
                                                <span>📲 WhatsApp</span>
                                            </a>
                                            <a
                                                href={telUrl}
                                                onClick={(e) => handleCallWithFeedback(e, provider.mobile, provider.fullName)}
                                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-2 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1"
                                                title={`Call ${getFormattedPhoneNumber(provider.mobile)}`}
                                            >
                                                <span>📞 Call</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SEND REQUEST & MESSAGE MODAL */}
            {selectedProvider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs uppercase font-black tracking-wider text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                                    Send Service Request & Message
                                </span>
                                <h3 className="text-2xl font-black text-slate-800 mt-1">
                                    {selectedProvider.fullName}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    📍 {selectedProvider.village}{selectedProvider.district ? `, ${selectedProvider.district}` : ''} | 📞 {getFormattedPhoneNumber(selectedProvider.mobile)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedProvider(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitRequest} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Service Required (સેવા પસંદ કરો)</label>
                                <select
                                    value={requestForm.service}
                                    onChange={(e) => setRequestForm({ ...requestForm, service: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-sm"
                                    required
                                >
                                    {selectedProvider.services?.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                    {(!selectedProvider.services || selectedProvider.services.length === 0) && (
                                        <option value="General Service">General Service</option>
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Required Date (જરૂરી તારીખ)</label>
                                    <input
                                        type="date"
                                        value={requestForm.date}
                                        onChange={(e) => setRequestForm({ ...requestForm, date: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time (સમય)</label>
                                    <select
                                        value={requestForm.time}
                                        onChange={(e) => setRequestForm({ ...requestForm, time: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-sm"
                                    >
                                        <option value="સવાર (Morning)">સવાર (Morning)</option>
                                        <option value="બપોર (Afternoon)">બપોર (Afternoon)</option>
                                        <option value="સાંજ (Evening)">સાંજ (Evening)</option>
                                        <option value="ગમે ત્યારે (Flexible)">ગમે ત્યારે (Flexible)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Message to Provider (તમારો સંદેશો / જરૂરિયાત)
                                </label>
                                <textarea
                                    rows="3"
                                    value={requestForm.message}
                                    onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                                    placeholder="દા.ત. મને 5 વીઘા કપાસની વાવણી માટે ટ્રેક્ટરની જરૂર છે..."
                                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800">
                                💡 <b>નોંધ:</b> વિનંતી મોકલ્યા પછી આ સંદેશો પ્રોવાઈડરના ડેશબોર્ડમાં દેખાશે અને તમે સીધા WhatsApp પર પણ મેસેજ મોકલી શકશો.
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedProvider(null)}
                                    className="w-1/3 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingRequest}
                                    className="w-2/3 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-md shadow-green-600/20 disabled:opacity-50"
                                >
                                    {sendingRequest ? 'Sending...' : 'Send Request & Message ➔'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
