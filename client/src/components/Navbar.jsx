import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../api';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { liveNotification } = useContext(SocketContext) || {};
    const navigate = useNavigate();

    const [isOnline, setIsOnline] = useState(user?.isOnline !== false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data || []);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (err) {
            // Ignore error if not logged in
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            if (user.role === 'serviceProvider' && user.isOnline !== undefined) {
                setIsOnline(user.isOnline);
            }
        }
    }, [user, liveNotification]);

    const handleToggleOnline = async () => {
        setTogglingStatus(true);
        try {
            const res = await api.put('/auth/toggle-online');
            if (res.data.success) {
                setIsOnline(res.data.isOnline);
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setTogglingStatus(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 backdrop-blur border-b bg-white/95 border-slate-200 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-2xl transform group-hover:scale-110 transition-transform">🚜</span>
                    <div>
                        <span className="font-black text-xl text-green-700 tracking-tight">Khedut Portal</span>
                        <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Uber Agri
                        </span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="flex gap-3 sm:gap-4 items-center">
                    <Link to="/" className="font-bold text-slate-700 hover:text-green-600 text-sm">
                        Home
                    </Link>

                    {/* ADMIN ONLY LINK: Never visible to normal users */}
                    {user && user.role === 'admin' && (
                        <Link 
                            to="/admin/dashboard" 
                            className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-amber-200 transition shadow-xs"
                        >
                            <span>🛡️</span>
                            <span>Admin Dashboard</span>
                        </Link>
                    )}

                    {/* Service Provider Navigation */}
                    {user && user.role === 'serviceProvider' && (
                        <>
                            {/* Online / Offline Quick Toggle Pill */}
                            <button
                                onClick={handleToggleOnline}
                                disabled={togglingStatus}
                                className={`px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 transition ${
                                    isOnline 
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                                        : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                                }`}
                                title="Click to toggle Online/Offline duty"
                            >
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                {isOnline ? 'ઓનલાઇન (Active)' : 'ઓફલાઇન (Resting)'}
                            </button>

                            <Link to="/provider-dashboard" className="font-bold text-slate-700 hover:text-green-600 text-sm">
                                Dashboard
                            </Link>
                        </>
                    )}

                    {/* Service Receiver Navigation */}
                    {user && user.role === 'serviceReceiver' && (
                        <>
                            <Link to="/search-services" className="font-bold text-slate-700 hover:text-green-600 text-sm">
                                Find Services
                            </Link>
                            <Link to="/my-bookings" className="font-bold text-slate-700 hover:text-green-600 text-sm">
                                My Bookings
                            </Link>
                        </>
                    )}

                    {/* Logged in User: Notifications & Logout */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowNotifDropdown(!showNotifDropdown);
                                        if (!showNotifDropdown && unreadCount > 0) handleMarkAllRead();
                                    }}
                                    className="p-1.5 text-slate-600 hover:text-green-700 rounded-xl hover:bg-slate-100 transition relative"
                                    title="Notifications"
                                >
                                    <span className="text-xl">🔔</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifDropdown && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                                        <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                            <span className="font-black text-xs text-slate-800">સૂચનાઓ (Notifications)</span>
                                            {notifications.length > 0 && (
                                                <button onClick={handleMarkAllRead} className="text-[11px] text-green-700 font-bold hover:underline">
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-slate-400">
                                                    કોઈ નવી સૂચના નથી (No notifications)
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n._id} className={`p-3 text-xs ${n.isRead ? 'bg-white' : 'bg-green-50/50'}`}>
                                                        <p className="font-black text-slate-800">{n.title}</p>
                                                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleLogout} 
                                className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-xl font-bold text-xs transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="font-bold text-slate-700 hover:text-green-600 text-sm">
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-sm shadow-xs transition"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}