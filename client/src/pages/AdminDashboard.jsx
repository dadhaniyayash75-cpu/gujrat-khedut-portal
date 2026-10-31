import React, { useState, useEffect } from 'react';
import api from '../api';
import { getWhatsAppUrl, getTelUrl, handleCallClick, getFormattedPhoneNumber } from '../utils/phoneUtils';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('users'); // 'overview', 'users', 'bookings', 'sms', 'mandi'
    
    // Stats State
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Users State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [actionId, setActionId] = useState(null);
    const [notification, setNotification] = useState(null);

    // Bookings State
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

    // SMS Logs State
    const [smsLogs, setSmsLogs] = useState([]);
    const [loadingSms, setLoadingSms] = useState(false);

    // Mandi Rate Form State
    const [newMandi, setNewMandi] = useState({
        yard_gu: '', crop_gu: '', min: '', max: '', district: '', arrival: ''
    });
    const [mandiMsg, setMandiMsg] = useState('');

    const showNotif = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // 1. Fetch Stats
    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await api.get('/admin/stats');
            if (res.data.success) setStats(res.data.stats);
        } catch (err) {
            console.error('Stats error:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    // 2. Fetch Users
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const params = {};
            if (userRoleFilter !== 'all') params.role = userRoleFilter;
            if (userSearch) params.search = userSearch;
            const res = await api.get('/admin/users', { params });
            if (res.data.success) setUsers(res.data.data || []);
        } catch (err) {
            console.error('Users error:', err);
            showNotif('error', 'Failed to load users from database');
        } finally {
            setLoadingUsers(false);
        }
    };

    // 3. Fetch Bookings
    const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
            const params = {};
            if (bookingStatusFilter !== 'all') params.status = bookingStatusFilter;
            const res = await api.get('/admin/bookings', { params });
            if (res.data.success) setBookings(res.data.data || []);
        } catch (err) {
            console.error('Bookings error:', err);
        } finally {
            setLoadingBookings(false);
        }
    };

    // 4. Fetch SMS Logs
    const fetchSmsLogs = async () => {
        setLoadingSms(true);
        try {
            const res = await api.get('/admin/sms-logs');
            if (res.data.success) setSmsLogs(res.data.data || []);
        } catch (err) {
            console.error('SMS error:', err);
        } finally {
            setLoadingSms(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'bookings') fetchBookings();
        else if (activeTab === 'sms') fetchSmsLogs();
        else if (activeTab === 'overview') fetchStats();
    }, [activeTab, userRoleFilter, bookingStatusFilter]);

    // Handle Block / Unblock User
    const handleToggleBlock = async (u) => {
        const action = u.isBlocked ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} user "${u.fullName}"?`)) return;
        setActionId(u._id);
        try {
            const res = await api.put(`/admin/users/${u._id}/block`);
            if (res.data.success) {
                setUsers(prev => prev.map(item => item._id === u._id ? res.data.user : item));
                showNotif('success', res.data.message);
            }
        } catch (err) {
            showNotif('error', err.response?.data?.message || 'Operation failed');
        } finally {
            setActionId(null);
        }
    };

    // Handle Delete User
    const handleDeleteUser = async (u) => {
        if (!window.confirm(`⚠️ DANGER: Permanently delete "${u.fullName}" (${u.mobile}) from MongoDB? This cannot be undone.`)) return;
        setActionId(u._id);
        try {
            const res = await api.delete(`/admin/users/${u._id}`);
            if (res.data.success) {
                setUsers(prev => prev.filter(item => item._id !== u._id));
                showNotif('success', res.data.message);
                fetchStats();
            }
        } catch (err) {
            showNotif('error', err.response?.data?.message || 'Delete failed');
        } finally {
            setActionId(null);
        }
    };

    // Handle Add Custom Mandi Rate
    const handleAddMandi = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/mandi/custom-rate', newMandi);
            if (res.data.success) {
                setMandiMsg('✓ નવી મંડી ભાવ સફળતાપૂર્વક ઉમેરાઈ ગઈ!');
                setNewMandi({ yard_gu: '', crop_gu: '', min: '', max: '', district: '', arrival: '' });
                setTimeout(() => setMandiMsg(''), 4000);
            }
        } catch (err) {
            setMandiMsg('Failed to add rate');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-white/20 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                            👑 Website Owner Portal
                        </span>
                        <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                            Authorized: Yash Dadhaniya
                        </span>
                    </div>
                    <h1 className="text-3xl font-black mt-2">Private Admin Dashboard</h1>
                    <p className="text-amber-100 text-sm mt-1">
                        Full platform administration: Database, Users, Uber Bookings, SMS Audit, and Live Mandi
                    </p>
                </div>

                <button 
                    onClick={() => { fetchStats(); if (activeTab === 'users') fetchUsers(); }} 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-1.5"
                >
                    <span>🔄</span> Refresh Data
                </button>
            </div>

            {/* Notification alert */}
            {notification && (
                <div className={`p-4 rounded-2xl font-bold mb-6 text-sm flex justify-between items-center ${
                    notification.type === 'success' 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                    <span>{notification.type === 'success' ? '✓' : '⚠️'} {notification.message}</span>
                    <button onClick={() => setNotification(null)} className="text-xs underline">Dismiss</button>
                </div>
            )}

            {/* Admin Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 mb-6">
                {[
                    { id: 'overview', label: '📊 Platform Overview', icon: '📊' },
                    { id: 'users', label: '👥 User Database & Management', icon: '👥' },
                    { id: 'bookings', label: '🚜 Uber/Rapido Bookings', icon: '🚜' },
                    { id: 'sms', label: '📱 SMS Notification Logs', icon: '📱' },
                    { id: 'mandi', label: '🌾 Live Mandi Rates Manager', icon: '🌾' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                            activeTab === tab.id 
                                ? 'bg-amber-600 text-white shadow-md' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB 1: OVERVIEW & STATS */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-slate-500 text-xs font-bold uppercase">Total Registered Users</span>
                            <p className="text-3xl font-black text-slate-800 mt-2">{stats?.totalUsers || 0}</p>
                            <span className="text-[11px] text-green-600 font-bold">Platform-wide</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-slate-500 text-xs font-bold uppercase">🚜 Service Providers</span>
                            <p className="text-3xl font-black text-blue-700 mt-2">{stats?.totalProviders || 0}</p>
                            <span className="text-[11px] text-emerald-600 font-bold">{stats?.activeProviders || 0} currently online</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-slate-500 text-xs font-bold uppercase">🌾 Farmers (Receivers)</span>
                            <p className="text-3xl font-black text-green-700 mt-2">{stats?.totalReceivers || 0}</p>
                            <span className="text-[11px] text-slate-400 font-medium">Registered customers</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-slate-500 text-xs font-bold uppercase">🚜 Total Service Bookings</span>
                            <p className="text-3xl font-black text-purple-700 mt-2">{stats?.totalBookings || 0}</p>
                            <span className="text-[11px] text-purple-600 font-bold">{stats?.completedBookings || 0} completed</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <h3 className="text-base font-black text-slate-800 mb-2">⚡ Active Booking Operations</h3>
                            <div className="space-y-3 mt-4">
                                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                                    <span className="font-bold text-xs text-amber-900">Pending Approval</span>
                                    <span className="font-black text-base text-amber-700">{stats?.pendingBookings || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                                    <span className="font-bold text-xs text-blue-900">Active (Accepted / On Way / In Progress)</span>
                                    <span className="font-black text-base text-blue-700">{stats?.activeBookings || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                    <span className="font-bold text-xs text-green-900">Successfully Completed</span>
                                    <span className="font-black text-base text-green-700">{stats?.completedBookings || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <h3 className="text-base font-black text-slate-800 mb-2">📱 Notifications & Audit</h3>
                            <div className="space-y-3 mt-4">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <span className="font-bold text-xs text-slate-700">Total SMS Notifications Sent/Simulated</span>
                                    <span className="font-black text-base text-slate-800">{stats?.totalSmsLogs || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <span className="font-bold text-xs text-slate-700">Farmer Reviews & Ratings Submitted</span>
                                    <span className="font-black text-base text-slate-800">{stats?.totalReviews || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: USER DATABASE MANAGEMENT */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">User Database Management</h2>
                            <p className="text-xs text-slate-500">Live database viewer restricted to website owner & company members</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'serviceProvider', 'serviceReceiver', 'admin'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setUserRoleFilter(r)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                        userRoleFilter === r 
                                            ? 'bg-amber-600 text-white' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {r === 'all' ? 'All Roles' : r === 'serviceProvider' ? '🚜 Providers' : r === 'serviceReceiver' ? '🌾 Farmers' : '👑 Admins'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <input 
                            type="text" 
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            placeholder="Search by name, mobile, village, district, or vehicle..."
                            className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {loadingUsers ? (
                        <div className="p-8 text-center text-slate-400 text-sm font-bold">Loading users from MongoDB...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No users match your criteria.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                                    <tr>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Location</th>
                                        <th className="p-3">Services / Vehicle</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map(u => (
                                        <tr key={u._id} className={u.isBlocked ? 'bg-red-50/50' : 'hover:bg-slate-50/80'}>
                                            <td className="p-3 font-bold text-slate-800">
                                                <div className="font-black text-sm">{u.fullName}</div>
                                                <div className="text-slate-500">{getFormattedPhoneNumber(u.mobile)}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                                    u.role === 'admin' 
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                                        : u.role === 'serviceProvider' 
                                                        ? 'bg-blue-100 text-blue-900' 
                                                        : 'bg-green-100 text-green-900'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                📍 {u.village || 'N/A'}{u.district ? `, ${u.district}` : ''}
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                {u.role === 'serviceProvider' ? (
                                                    <div>
                                                        <div className="font-semibold">{u.vehicle || 'Equipment'} • {u.rate || '₹500/hr'}</div>
                                                        <div className="text-[11px] text-slate-500">{u.services?.join(', ') || 'General'}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {u.isBlocked ? (
                                                    <span className="bg-red-100 text-red-800 font-black px-2 py-0.5 rounded-full text-[10px]">
                                                        Blocked
                                                    </span>
                                                ) : u.role === 'serviceProvider' && !u.isOnline ? (
                                                    <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                                                        Offline
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                {u.role !== 'admin' && (
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleToggleBlock(u)}
                                                            disabled={actionId === u._id}
                                                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                                                u.isBlocked 
                                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                            }`}
                                                        >
                                                            {u.isBlocked ? 'Unblock' : 'Block'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            disabled={actionId === u._id}
                                                            className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg font-bold text-[11px] transition"
                                                            title="Permanently remove user"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: UBER BOOKINGS PLATFORM-WIDE */}
            {activeTab === 'bookings' && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">All Service Bookings</h2>
                            <p className="text-xs text-slate-500">Live Uber/Rapido lifecycle orders and tracking</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'accepted', 'on_the_way', 'completed', 'cancelled'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setBookingStatusFilter(st)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        bookingStatusFilter === st 
                                            ? 'bg-amber-600 text-white' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {st.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingBookings ? (
                        <div className="p-8 text-center text-slate-400 text-sm font-bold">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No bookings recorded yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                                    <tr>
                                        <th className="p-3">ID / Date</th>
                                        <th className="p-3">Farmer (Receiver)</th>
                                        <th className="p-3">Provider</th>
                                        <th className="p-3">Service</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bookings.map(b => (
                                        <tr key={b._id} className="hover:bg-slate-50/80">
                                            <td className="p-3">
                                                <div className="font-black text-slate-900">{b.bookingId}</div>
                                                <div className="text-[11px] text-slate-400">{b.date} ({b.time})</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-800">{b.receiverId?.fullName || 'Farmer'}</div>
                                                <div className="text-slate-500">{b.receiverLocation?.village || 'Farm'}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-blue-700">{b.providerId?.fullName || 'Provider'}</div>
                                                <div className="text-slate-500">{b.providerId?.vehicle || 'Equipment'}</div>
                                            </td>
                                            <td className="p-3 font-semibold text-slate-700">
                                                {b.service}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    b.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    b.status === 'on_the_way' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                                    b.status === 'accepted' ? 'bg-indigo-100 text-indigo-800' :
                                                    b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="p-3 font-bold text-slate-900">
                                                {b.finalPrice || b.estimatedPrice || '₹500/hr'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: SMS AUDIT LOGS */}
            {activeTab === 'sms' && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">SMS Notification Audit Logs</h2>
                            <p className="text-xs text-slate-500">Live records of all SMS dispatched to providers & farmers</p>
                        </div>
                        <button onClick={fetchSmsLogs} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs">
                            🔄 Refresh Logs
                        </button>
                    </div>

                    {loadingSms ? (
                        <div className="p-8 text-center text-slate-400 text-sm font-bold">Loading SMS logs...</div>
                    ) : smsLogs.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No SMS dispatched yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                                    <tr>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Recipient</th>
                                        <th className="p-3">Gateway</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Message Body</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {smsLogs.map(l => (
                                        <tr key={l._id} className="hover:bg-slate-50/80">
                                            <td className="p-3 whitespace-nowrap text-slate-500">
                                                {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString()}
                                            </td>
                                            <td className="p-3 font-bold text-slate-800 whitespace-nowrap">
                                                +91 {l.mobile}
                                            </td>
                                            <td className="p-3 font-semibold uppercase text-slate-600">
                                                {l.gateway}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                    l.status === 'sent' || l.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    l.status === 'simulated' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-[11px] text-slate-700 max-w-md">
                                                {l.message}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 5: LIVE MANDI RATES MANAGER */}
            {activeTab === 'mandi' && (
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Live Mandi Rates Manager</h2>
                    <p className="text-xs text-slate-500 mb-6">Add or update custom real-time APMC Mandi rates visible across Gujarat Khedut Portal</p>

                    {mandiMsg && (
                        <div className="p-3 mb-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold">
                            {mandiMsg}
                        </div>
                    )}

                    <form onSubmit={handleAddMandi} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">APMC Yard (માર્કેટ યાર્ડ)</label>
                            <input 
                                type="text"
                                value={newMandi.yard_gu}
                                onChange={e => setNewMandi({ ...newMandi, yard_gu: e.target.value })}
                                placeholder="e.g. રાજકોટ (Rajkot)"
                                required
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Crop / Commodity (પાકનું નામ)</label>
                            <input 
                                type="text"
                                value={newMandi.crop_gu}
                                onChange={e => setNewMandi({ ...newMandi, crop_gu: e.target.value })}
                                placeholder="e.g. મગફળી જી-૨૦ (Groundnut)"
                                required
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">District (જિલ્લો)</label>
                            <input 
                                type="text"
                                value={newMandi.district}
                                onChange={e => setNewMandi({ ...newMandi, district: e.target.value })}
                                placeholder="e.g. Rajkot"
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Min Price (નીચો ભાવ)</label>
                            <input 
                                type="text"
                                value={newMandi.min}
                                onChange={e => setNewMandi({ ...newMandi, min: e.target.value })}
                                placeholder="e.g. 1350"
                                required
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Max Price (ઊંચો ભાવ)</label>
                            <input 
                                type="text"
                                value={newMandi.max}
                                onChange={e => setNewMandi({ ...newMandi, max: e.target.value })}
                                placeholder="e.g. 1620"
                                required
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Arrival Volume (આવક)</label>
                            <input 
                                type="text"
                                value={newMandi.arrival}
                                onChange={e => setNewMandi({ ...newMandi, arrival: e.target.value })}
                                placeholder="e.g. 25,000 ગુણી"
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <button 
                                type="submit" 
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition"
                            >
                                ＋ Add Custom Mandi Rate (ભાવ ઉમેરો)
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
