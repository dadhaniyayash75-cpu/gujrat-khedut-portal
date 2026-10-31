import React, { useState, useEffect } from 'react';
import api from '../api';
import { getWhatsAppUrl, getTelUrl, handleCallClick, getFormattedPhoneNumber } from '../utils/phoneUtils';

export default function DatabaseView() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/all-users');
            setUsers(res.data.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setNotification({ type: 'error', message: 'Failed to load users from database.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (user) => {
        const confirmMsg = `Are you sure you want to permanently delete user "${user.fullName}" (${user.mobile}) from the database?`;
        if (!window.confirm(confirmMsg)) return;

        setDeletingId(user._id);
        try {
            const res = await api.delete(`/auth/users/${user._id}`);
            if (res.data && res.data.success) {
                setUsers(prev => prev.filter(u => u._id !== user._id));
                setNotification({
                    type: 'success',
                    message: `User "${user.fullName}" deleted successfully!`
                });
            } else {
                setNotification({
                    type: 'error',
                    message: res.data?.message || 'Failed to delete user.'
                });
            }
        } catch (err) {
            console.error('Delete error:', err);
            setNotification({
                type: 'error',
                message: err.response?.data?.message || 'Server error while deleting user.'
            });
        } finally {
            setDeletingId(null);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const filteredUsers = users.filter(u => {
        const query = searchTerm.toLowerCase();
        return (
            (u.fullName && u.fullName.toLowerCase().includes(query)) ||
            (u.mobile && u.mobile.includes(query)) ||
            (u.village && u.village.toLowerCase().includes(query)) ||
            (u.district && u.district.toLowerCase().includes(query)) ||
            (u.role && u.role.toLowerCase().includes(query))
        );
    });

    const providerCount = users.filter(u => u.role === 'serviceProvider').length;
    const farmerCount = users.filter(u => u.role !== 'serviceProvider').length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                
                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Database Dashboard</h2>
                        <p className="text-slate-500 text-sm mt-1">Live user database management and registered accounts</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-blue-50 text-blue-800 px-3.5 py-1.5 rounded-xl font-bold border border-blue-200 text-sm">
                            Total: {users.length}
                        </span>
                        <span className="bg-purple-50 text-purple-700 px-3.5 py-1.5 rounded-xl font-bold border border-purple-200 text-sm">
                            🚜 Providers: {providerCount}
                        </span>
                        <span className="bg-green-50 text-green-700 px-3.5 py-1.5 rounded-xl font-bold border border-green-200 text-sm">
                            🌾 Farmers: {farmerCount}
                        </span>
                        <button
                            onClick={fetchUsers}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-sm transition"
                            title="Refresh data"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Notifications Alert */}
                {notification && (
                    <div className={`p-4 rounded-xl mb-6 font-bold flex justify-between items-center transition ${
                        notification.type === 'success' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                        <span>{notification.type === 'success' ? '✓ ' : '⚠️ '}{notification.message}</span>
                        <button onClick={() => setNotification(null)} className="text-sm underline ml-4">Close</button>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="🔍 Search user by Name, Mobile, Village, or District..."
                        className="w-full p-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition"
                    />
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="text-center py-12 text-slate-500 font-bold">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-green-600 rounded-full mb-2"></div>
                        <p>Loading database records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-xs font-bold border-b">
                                <tr>
                                    <th className="p-4">Full Name</th>
                                    <th className="p-4">Mobile Number</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Village / District</th>
                                    <th className="p-4">Service Details</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-bold text-slate-800">
                                            {user.fullName}
                                        </td>
                                        <td className="p-4 text-slate-600 font-mono">
                                            <div className="font-bold text-slate-800">{getFormattedPhoneNumber(user.mobile)}</div>
                                            <div className="flex gap-2 mt-1">
                                                <a 
                                                    href={getWhatsAppUrl(user.mobile, `નમસ્તે ${user.fullName}, ગુજરાત ખેડૂત પોર્ટલ પરથી આપનો સંપર્ક કરવામાં આવ્યો છે.`)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-0.5 hover:underline"
                                                    title="WhatsApp"
                                                >
                                                    📲 WhatsApp
                                                </a>
                                                <a 
                                                    href={getTelUrl(user.mobile)}
                                                    onClick={(e) => handleCallClick(e, user.mobile, user.fullName)}
                                                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-0.5 hover:underline"
                                                    title="Call"
                                                >
                                                    📞 Call
                                                </a>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                                user.role === 'serviceProvider' 
                                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                : 'bg-green-100 text-green-700 border border-green-200'
                                            }`}>
                                                {user.role === 'serviceProvider' ? 'Provider' : 'Farmer'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            <p className="font-semibold">{user.village || 'N/A'}</p>
                                            {user.district && <p className="text-xs text-slate-400">{user.district}</p>}
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {user.role === 'serviceProvider' ? (
                                                <div className="text-xs space-y-0.5">
                                                    <p><b>Vehicle:</b> {user.vehicle || 'N/A'}</p>
                                                    <p><b>Services:</b> {user.services?.join(', ') || 'N/A'}</p>
                                                    <p><b>Rate:</b> {user.rate || 'N/A'}</p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={deletingId === user._id}
                                                className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 px-3.5 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                                                title={`Delete ${user.fullName}`}
                                            >
                                                {deletingId === user._id ? (
                                                    <span>Deleting...</span>
                                                ) : (
                                                    <>
                                                        <span>🗑️</span> Delete
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                                            {searchTerm ? 'No matching users found for your search.' : 'No users found in the database.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
