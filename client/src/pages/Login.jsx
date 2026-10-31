import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function Login() {
    const [selectedRole, setSelectedRole] = useState('serviceReceiver'); // 'serviceReceiver', 'serviceProvider', 'admin'
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { 
                mobile, 
                password,
                selectedRole 
            });
            login(res.data.user, res.data.token);
            
            // Redirect based on role
            if (res.data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (res.data.user.role === 'serviceProvider') {
                navigate('/provider-dashboard');
            } else {
                navigate('/search-services');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-black mb-1 text-slate-800">Login (પ્રવેશ કરો)</h2>
            <p className="text-xs text-slate-500 mb-6">Select your role and enter registered mobile number</p>

            {/* 3 Role Selection Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-100 rounded-2xl">
                <button
                    type="button"
                    onClick={() => { setSelectedRole('serviceReceiver'); setError(''); }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                        selectedRole === 'serviceReceiver' 
                            ? 'bg-white text-green-700 shadow-sm border border-slate-200' 
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <span>🌾</span>
                    <span>ખેડૂત (Farmer)</span>
                </button>
                <button
                    type="button"
                    onClick={() => { setSelectedRole('serviceProvider'); setError(''); }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                        selectedRole === 'serviceProvider' 
                            ? 'bg-white text-blue-700 shadow-sm border border-slate-200' 
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <span>🚜</span>
                    <span>પ્રોવાઈડર</span>
                </button>
                <button
                    type="button"
                    onClick={() => { setSelectedRole('admin'); setError(''); }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                        selectedRole === 'admin' 
                            ? 'bg-amber-500 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <span>🛡️</span>
                    <span>એડમિન (Owner)</span>
                </button>
            </div>

            {selectedRole === 'admin' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl mb-4 text-xs font-semibold flex items-center gap-2">
                    <span>👑</span>
                    <span>વેબસાઇટ ઓનર & કંપની મેમ્બર્સ માટે (Admin Login with password: "yash")</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-1.5">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Mobile Number (મોબાઈલ નંબર)
                    </label>
                    <input 
                        type="tel" 
                        value={mobile} 
                        onChange={e => setMobile(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium" 
                        placeholder={selectedRole === 'admin' ? "Admin Mobile (e.g. 9999999999)" : "e.g. 9876543210"}
                        required 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        {selectedRole === 'admin' ? "Admin Password (એડમિન પાસવર્ડ)" : "Password (પાસવર્ડ)"}
                    </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium" 
                        placeholder={selectedRole === 'admin' ? "Enter 'yash'" : "••••••••"}
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full font-bold py-3.5 rounded-xl disabled:opacity-50 transition shadow-md text-sm mt-2 text-white ${
                        selectedRole === 'admin' 
                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                            : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                    }`}
                >
                    {loading ? 'Verifying...' : selectedRole === 'admin' ? 'Login as Admin (એડમિન પ્રવેશ) ➔' : 'Login (લૉગિન કરો) ➔'}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 border-t pt-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 font-bold hover:underline">
                    Create New Account (નવું એકાઉન્ટ બનાવો)
                </Link>
            </div>
        </div>
    );
}