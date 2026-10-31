import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { getWhatsAppUrl, handleCallClick, getFormattedPhoneNumber } from '../utils/phoneUtils';

export default function ProviderDashboard() {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext) || {};
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(user?.isOnline !== false);
    const [togglingOnline, setTogglingOnline] = useState(false);
    const [actionMsg, setActionMsg] = useState(null);
    const [copyNotification, setCopyNotification] = useState(null);
    const [selectedTab, setSelectedTab] = useState('active'); // 'active', 'pending', 'completed'

    const fetchRequests = async () => {
        try {
            const res = await api.get('/bookings/my');
            setRequests(res.data.data || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Real-Time Socket Listener
    useEffect(() => {
        if (!socket) return;
        const handleNewRequest = () => {
            fetchRequests();
            setActionMsg('નવો સર્વિસ રિક્વેસ્ટ મળ્યો છે!');
            setTimeout(() => setActionMsg(null), 5000);
        };
        socket.on('new_booking_request', handleNewRequest);
        return () => {
            socket.off('new_booking_request', handleNewRequest);
        };
    }, [socket]);

    const handleToggleOnline = async () => {
        setTogglingOnline(true);
        try {
            const res = await api.put('/auth/toggle-online');
            if (res.data.success) {
                setIsOnline(res.data.isOnline);
            }
        } catch (err) {
            alert('Failed to toggle status');
        } finally {
            setTogglingOnline(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            let finalPrice = undefined;
            if (newStatus === 'completed') {
                const enteredPrice = window.prompt('કૃપા કરીને આખરી રકમ (Final Price) દાખલ કરો:', '₹2,000');
                if (enteredPrice) finalPrice = enteredPrice;
            }

            await api.put(`/bookings/${id}/status`, { status: newStatus, finalPrice });
            setActionMsg(`બુકિંગ સ્ટેટસ બદલાઈને "${newStatus}" થયું છે!`);
            setTimeout(() => setActionMsg(null), 4000);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleCallWithFeedback = (e, mobile, name) => {
        handleCallClick(e, mobile, name);
        setCopyNotification(`કૉલ નંબર: ${getFormattedPhoneNumber(mobile)}`);
        setTimeout(() => setCopyNotification(null), 4000);
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const activeRequests = requests.filter(r => ['accepted', 'on_the_way', 'arrived', 'service_started'].includes(r.status));
    const completedRequests = requests.filter(r => ['completed', 'cancelled', 'rejected'].includes(r.status));

    const displayedRequests = selectedTab === 'pending' ? pendingRequests : selectedTab === 'active' ? activeRequests : completedRequests;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {copyNotification && (
                <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce">
                    📞 {copyNotification}
                </div>
            )}

            {/* Header Card with Online / Offline Toggle */}
            <div className={`p-6 sm:p-8 rounded-3xl shadow-lg mb-8 text-white transition-all ${
                isOnline 
                    ? 'bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900' 
                    : 'bg-gradient-to-r from-slate-700 to-slate-900'
            }`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-white/20 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                                🚜 Service Provider Dashboard
                            </span>
                            {/* Live Duty Pill */}
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                                isOnline ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-950 animate-pulse' : 'bg-rose-950'}`}></span>
                                {isOnline ? 'Online (સેવા ઉપલબ્ધ)' : 'Offline (વિશ્રામ પર)'}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black mt-2">{user?.fullName || 'Provider'}</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            📍 {user?.village || 'Gujarat'}{user?.district ? `, ${user.district}` : ''} • 🚜 {user?.vehicle || 'Equipment'} • {user?.rate || '₹500/hr'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* 1-Click Online Toggle Button */}
                        <button
                            onClick={handleToggleOnline}
                            disabled={togglingOnline}
                            className={`px-5 py-3 rounded-2xl font-black text-xs shadow-lg transition flex items-center gap-2 ${
                                isOnline 
                                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30' 
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                            }`}
                        >
                            <span>{isOnline ? '⏸️' : '▶️'}</span>
                            {isOnline ? 'Go Offline (વિશ્રામ લો)' : 'Go Online (સેવા ચાલુ કરો)'}
                        </button>

                        <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-2xl text-center min-w-[90px]">
                            <p className="text-2xl font-black">{pendingRequests.length}</p>
                            <p className="text-[11px] text-blue-100 font-semibold">New Requests</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offline Alert Warning */}
            {!isOnline && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>તમે હાલ ઓફલાઇન (Offline) છો. ઓનલાઇન ન થાઓ ત્યાં સુધી ખેડૂતો સર્ચ પરિણામોમાં તમારું ટ્રેક્ટર જોઈ શકશે નહીં.</span>
                </div>
            )}

            {/* Action Alert */}
            {actionMsg && (
                <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-2xl font-bold mb-6 flex justify-between items-center text-xs">
                    <span>✓ {actionMsg}</span>
                    <button onClick={() => setActionMsg(null)} className="underline">Close</button>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-3 mb-6">
                {[
                    { id: 'active', label: `⚡ ચાલુ ઓર્ડર્સ (${activeRequests.length})` },
                    { id: 'pending', label: `🔔 નવા રિક્વેસ્ટ (${pendingRequests.length})` },
                    { id: 'completed', label: `✅ પૂર્ણ થયેલ (${completedRequests.length})` }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                            selectedTab === tab.id 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm font-bold">ઓર્ડર્સ લોડ થઈ રહ્યા છે...</div>
            ) : displayedRequests.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
                    આ કેટેગરીમાં કોઈ રિક્વેસ્ટ નથી.
                </div>
            ) : (
                <div className="space-y-4">
                    {displayedRequests.map(r => (
                        <div key={r._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-lg text-slate-900">{r.service}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                        r.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        r.status === 'on_the_way' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                        r.status === 'arrived' ? 'bg-purple-100 text-purple-800' :
                                        r.status === 'service_started' ? 'bg-amber-100 text-amber-800' :
                                        r.status === 'accepted' ? 'bg-indigo-100 text-indigo-800' :
                                        r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        ● {r.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-600">
                                    ખેડૂત: <strong className="text-slate-900">{r.receiverId?.fullName || 'Farmer'}</strong> • 📍 ગામ: <strong>{r.receiverLocation?.village || r.receiverId?.village}</strong>
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    તારીખ: <strong>{r.date}</strong> ({r.time}) • અંતર: <strong>આશરે {r.distanceKm || 10} KM</strong>
                                </p>
                                {r.message && (
                                    <p className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700 italic">
                                        💬 "{r.message}"
                                    </p>
                                )}

                                {/* Customer Contact Buttons (When Accepted) */}
                                {r.status !== 'pending' && r.status !== 'rejected' && r.receiverId?.mobile && (
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={(e) => handleCallWithFeedback(e, r.receiverId.mobile, r.receiverId.fullName)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow-xs"
                                        >
                                            <span>📞</span> {getFormattedPhoneNumber(r.receiverId.mobile)}
                                        </button>
                                        <a
                                            href={getWhatsAppUrl(r.receiverId.mobile, `નમસ્તે ${r.receiverId.fullName}, હું આપના ખેડૂત પોર્ટલ બુકિંગ (${r.service}) માટે સંપર્ક કરું છું.`)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow-xs"
                                        >
                                            <span>💬</span> WhatsApp
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* UBER / RAPIDO STEPPER ACTIONS */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                                {r.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(r._id, 'accepted')}
                                            className="bg-green-600 hover:bg-green-700 text-white font-black py-2.5 px-5 rounded-2xl text-xs shadow-md transition"
                                        >
                                            ✓ સ્વીકારો (Accept)
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(r._id, 'rejected')}
                                            className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 px-4 rounded-2xl text-xs border border-red-200 transition"
                                        >
                                            ✕ રદ (Decline)
                                        </button>
                                    </>
                                )}

                                {r.status === 'accepted' && (
                                    <button
                                        onClick={() => handleStatusUpdate(r._id, 'on_the_way')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5"
                                    >
                                        <span>🚜</span> રસ્તામાં નીકળ્યા (I'm On The Way) ➔
                                    </button>
                                )}

                                {r.status === 'on_the_way' && (
                                    <button
                                        onClick={() => handleStatusUpdate(r._id, 'arrived')}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-black py-2.5 px-5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5"
                                    >
                                        <span>📍</span> ખેતરે પહોંચી ગયા (Arrived at Farm) ➔
                                    </button>
                                )}

                                {r.status === 'arrived' && (
                                    <button
                                        onClick={() => handleStatusUpdate(r._id, 'service_started')}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 px-5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5"
                                    >
                                        <span>⚙️</span> ખેતીકામ શરૂ કર્યું (Start Service) ➔
                                    </button>
                                )}

                                {r.status === 'service_started' && (
                                    <button
                                        onClick={() => handleStatusUpdate(r._id, 'completed')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5"
                                    >
                                        <span>✅</span> કામ પૂર્ણ થયું (Mark Completed) ➔
                                    </button>
                                )}

                                <Link
                                    to={`/track/${r._id}`}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3.5 rounded-2xl text-xs text-center transition"
                                >
                                    📍 Live Map
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
