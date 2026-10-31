import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

# src/pages/SearchServices.jsx
create_file('client/src/pages/SearchServices.jsx', '''
import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function SearchServices() {
    const { user } = useContext(AuthContext);
    const [providers, setProviders] = useState([]);
    const [serviceType, setServiceType] = useState('');
    const [village, setVillage] = useState(user?.village || '');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [requests, setRequests] = useState([]);

    const SERVICES_LIST = ["Tractor", "Harvester", "Rotavator", "Cultivator", "Seed Drill", "Water Tanker", "Agricultural Transport", "Other"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const provRes = await api.get('/services');
                setProviders(provRes.data.data);
                
                const reqRes = await api.get('/bookings/my');
                setRequests(reqRes.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleSearch = () => {
        if (!serviceType) return alert('Select a service');
        if (!village) return alert('Enter village');
        
        // Simple client-side filtering mock for distance
        const matched = providers.filter(p => p.services.includes(serviceType) && p.village.toLowerCase() === village.toLowerCase());
        setResults(matched);
        setSearched(true);
    };

    const handleRequest = async (providerId) => {
        try {
            await api.post('/bookings', {
                providerId,
                service: serviceType,
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
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-3xl font-black mb-6">Find Farming Services</h2>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-bold mb-1">Service Type</label>
                    <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full p-3 border rounded-xl">
                        <option value="">-- Select --</option>
                        {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-bold mb-1">Your Village</label>
                    <input type="text" value={village} onChange={e => setVillage(e.target.value)} className="w-full p-3 border rounded-xl" />
                </div>
                <button onClick={handleSearch} className="bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700">Search</button>
            </div>

            {searched && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Results</h3>
                    {results.length === 0 ? <p>No providers found in your village for this service.</p> : (
                        <div className="grid gap-4">
                            {results.map(r => (
                                <div key={r._id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-lg">{r.fullName}</h4>
                                        <p className="text-sm text-slate-500">{r.vehicle} - {r.rate}</p>
                                    </div>
                                    <button onClick={() => handleRequest(r._id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Request Service</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div>
                <h3 className="text-xl font-bold mb-4">My Requests</h3>
                <div className="grid gap-4">
                    {requests.map(req => (
                        <div key={req._id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                            <div>
                                <p className="font-bold">{req.service}</p>
                                <p className="text-sm">Provider: {req.providerId?.fullName || 'Unknown'}</p>
                            </div>
                            <span className="font-bold text-sm uppercase px-3 py-1 bg-amber-100 text-amber-700 rounded-full">{req.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
''')

# src/pages/ProviderDashboard.jsx
create_file('client/src/pages/ProviderDashboard.jsx', '''
import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function ProviderDashboard() {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get('/bookings/my');
                setRequests(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRequests();
    }, []);

    const handleStatus = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            const res = await api.get('/bookings/my');
            setRequests(res.data.data);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-3xl font-black mb-6">Provider Dashboard</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold">{user.fullName}</h3>
                    <p className="text-slate-500">{user.village} | Provider</p>
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold border border-green-200">
                    Active Profile
                </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Service Requests</h3>
            {requests.length === 0 ? <p>No incoming requests.</p> : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <div key={req._id} className="bg-white p-5 rounded-xl border">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <h4 className="font-bold text-lg">{req.service}</h4>
                                    <p className="text-sm">From: {req.receiverId?.fullName} ({req.receiverId?.village})</p>
                                    <p className="text-sm">Mobile: {req.receiverId?.mobile}</p>
                                </div>
                                <span className="font-bold text-sm uppercase px-3 py-1 bg-slate-100 rounded-full h-min">{req.status}</span>
                            </div>
                            {req.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleStatus(req._id, 'accepted')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">Accept</button>
                                    <button onClick={() => handleStatus(req._id, 'rejected')} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold">Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
''')

# src/main.jsx
create_file('client/src/main.jsx', '''
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
''')

print("Remaining pages scaffolded.")
