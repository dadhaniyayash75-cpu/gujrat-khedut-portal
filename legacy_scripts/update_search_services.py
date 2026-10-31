import os

content = """
import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
function MapRecenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
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
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [requests, setRequests] = useState([]);

    const SERVICES_LIST = ["All", "Tractor", "Harvester", "Rotavator", "Cultivator", "Seed Drill", "Water Tanker", "Agricultural Transport", "Other"];

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const reqRes = await api.get('/bookings/my');
                setRequests(reqRes.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRequests();
    }, []);

    const handleSearch = async () => {
        if (!village) return alert('Enter village name');
        
        setLoading(true);
        setErrorMsg('');
        setSearched(false);
        setResults([]);
        
        try {
            const res = await api.post('/services/search', {
                service: serviceType,
                village,
                district,
                radiusKm: Number(radius)
            });
            
            if (res.data.success) {
                setResults(res.data.providers);
                setSearchLocation(res.data.searchLocation);
                setSearched(true);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to search services. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (providerId, providerService) => {
        try {
            await api.post('/bookings', {
                providerId,
                service: providerService || serviceType,
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                message: 'Need farming service'
            });
            alert('Request sent!');
            const reqRes = await api.get('/bookings/my');
            setRequests(reqRes.data.data);
        } catch (err) {
            alert('Failed to send request');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <h2 className="text-3xl font-black mb-6 text-slate-800">Search Farming Services</h2>
            
            {/* SEARCH FORM */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold mb-1">Service Type</label>
                    <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50">
                        {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold mb-1">Village</label>
                    <input type="text" value={village} onChange={e => setVillage(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="e.g. Manavadar" />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold mb-1">District</label>
                    <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="e.g. Junagadh" />
                </div>
                <div className="w-[120px]">
                    <label className="block text-sm font-bold mb-1">Radius</label>
                    <select value={radius} onChange={e => setRadius(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50">
                        <option value="10">10 KM</option>
                        <option value="20">20 KM</option>
                        <option value="25">25 KM</option>
                        <option value="30">30 KM</option>
                        <option value="40">40 KM</option>
                        <option value="50">50 KM</option>
                    </select>
                </div>
                <button 
                    onClick={handleSearch} 
                    disabled={loading}
                    className="bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {errorMsg && (
                <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-bold">
                    {errorMsg}
                </div>
            )}

            {searched && searchLocation && (
                <div className="mb-6 bg-blue-50 text-blue-900 p-4 rounded-xl border border-blue-200">
                    <p className="font-bold">
                        📍 Searching around: {searchLocation.village} {district ? `, ${district}` : ''}
                    </p>
                    <p className="text-sm mt-1">Found {results.length} providers within {radius} KM.</p>
                </div>
            )}

            {searched && (
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    {/* RESULTS LIST */}
                    <div className="lg:w-1/2 flex flex-col gap-4">
                        {results.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl border text-center">
                                <h3 className="font-bold text-lg mb-2">No providers found</h3>
                                <p className="text-slate-500 mb-4">No {serviceType !== 'All' ? serviceType : ''} service providers were found within {radius} KM of {village}.</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <button onClick={() => { setRadius(40); handleSearch(); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50">Search within 40 KM</button>
                                    <button onClick={() => { setRadius(50); handleSearch(); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50">Search within 50 KM</button>
                                </div>
                            </div>
                        ) : (
                            results.map(r => (
                                <div key={r._id} className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-xl text-slate-800">{r.fullName}</h4>
                                            <p className="text-sm font-bold text-green-700 mt-1">✓ Service Provider</p>
                                            <p className="text-sm text-slate-500 mt-1">📍 {r.village}{r.district ? `, ${r.district}` : ''}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-amber-100 text-amber-800 font-black px-3 py-1 rounded-lg text-sm">
                                                {r.distanceKm ? r.distanceKm.toFixed(1) + ' KM' : '? KM'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 mt-2">
                                        <p><b>Services:</b> {r.services?.join(', ') || 'N/A'}</p>
                                        <p><b>Vehicle:</b> {r.vehicle || 'N/A'}</p>
                                        <p><b>Rate:</b> {r.rate || 'N/A'}</p>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleRequest(r._id, r.services?.[0])} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700">Request Service</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* MAP */}
                    <div className="lg:w-1/2 h-[500px] bg-slate-100 rounded-2xl border overflow-hidden relative z-0">
                        {searchLocation && (
                            <MapContainer 
                                center={[searchLocation.latitude, searchLocation.longitude]} 
                                zoom={10} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                
                                <MapRecenter center={[searchLocation.latitude, searchLocation.longitude]} />

                                {/* Taker Location Marker */}
                                <Marker position={[searchLocation.latitude, searchLocation.longitude]} icon={takerIcon}>
                                    <Popup>
                                        <div className="font-bold text-center">Your Location<br/>{searchLocation.village}</div>
                                    </Popup>
                                </Marker>

                                {/* Provider Markers */}
                                {results.map(r => (
                                    r.location && r.location.coordinates.length === 2 ? (
                                        <Marker 
                                            key={r._id} 
                                            position={[r.location.coordinates[1], r.location.coordinates[0]]}
                                            icon={providerIcon}
                                        >
                                            <Popup>
                                                <div className="p-1">
                                                    <h3 className="font-bold text-md">{r.fullName}</h3>
                                                    <p className="text-xs mt-1">📍 {r.village}</p>
                                                    <p className="text-xs font-bold mt-1">🚜 {r.services?.join(', ')}</p>
                                                    <p className="text-xs mt-1 text-green-700 font-bold">{r.distanceKm?.toFixed(1)} KM away</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ) : null
                                ))}
                            </MapContainer>
                        )}
                        {!searchLocation && (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                Map will appear after searching
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-2xl font-black mb-4">My Sent Requests</h3>
                {requests.length === 0 ? <p className="text-slate-500">No requests sent yet.</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {requests.map(req => (
                            <div key={req._id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-bold">{req.service}</p>
                                    <p className="text-sm text-slate-500">Provider: {req.providerId?.fullName || 'Unknown'} ({req.providerId?.village || 'Unknown'})</p>
                                </div>
                                <span className={`font-bold text-xs uppercase px-3 py-1 rounded-full ${
                                    req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {req.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
"""

with open('client/src/pages/SearchServices.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
    
print("SearchServices.jsx updated with Leaflet Map!")
