import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '', 
        mobile: '', 
        password: '', 
        role: 'serviceReceiver', 
        village: '', 
        district: '',
        services: [], 
        vehicle: '', 
        rate: '',
        pricingType: 'per_hour'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const SERVICES_LIST = [
        "Tractor", "Harvester", "Rotavator", "Cultivator", 
        "Seed Drill", "Water Tanker", "Agricultural Transport", 
        "Sprayer", "Thresher", "Other"
    ];

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleServiceToggle = srv => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(srv) ? prev.services.filter(s => s !== srv) : [...prev.services, srv]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.role === 'serviceProvider' && formData.services.length === 0) {
            return setError('કૃપા કરીને ઓછામાં ઓછી એક સર્વિસ પસંદ કરો (Please select at least one service)');
        }

        if (formData.role === 'admin' && formData.password !== 'yash') {
            return setError('અમાન્ય એડમિન પાસવર્ડ! ફક્ત વેબસાઇટ ઓનર અને કંપની મેમ્બર માટે પાસવર્ડ "yash" હોવો જરૂરી છે.');
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/register', formData);
            login(res.data.user, res.data.token);
            
            if (res.data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (res.data.user.role === 'serviceProvider') {
                navigate('/provider-dashboard');
            } else {
                navigate('/search-services');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'રજીસ્ટ્રેશન નિષ્ફળ ગયું. કૃપા કરીને વિગતો તપાસો.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-3xl shadow-xl border border-slate-100 mb-12">
            <h2 className="text-2xl font-black mb-1 text-slate-800">Create Account (ખાતું બનાવો)</h2>
            <p className="text-xs text-slate-500 mb-6">Join Gujarat Khedut Portal as a Farmer, Service Provider, or Admin</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-1.5">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* 3 Role Selection Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <label className={`p-3 rounded-2xl border text-center cursor-pointer font-bold text-xs transition ${
                        formData.role === 'serviceReceiver' 
                            ? 'bg-green-100 border-green-500 text-green-900 shadow-xs' 
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}>
                        <input type="radio" name="role" value="serviceReceiver" className="hidden" checked={formData.role === 'serviceReceiver'} onChange={handleChange} />
                        🌾 ખેડૂત (Farmer)
                    </label>

                    <label className={`p-3 rounded-2xl border text-center cursor-pointer font-bold text-xs transition ${
                        formData.role === 'serviceProvider' 
                            ? 'bg-blue-100 border-blue-500 text-blue-900 shadow-xs' 
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}>
                        <input type="radio" name="role" value="serviceProvider" className="hidden" checked={formData.role === 'serviceProvider'} onChange={handleChange} />
                        🚜 પ્રોવાઈડર
                    </label>

                    <label className={`p-3 rounded-2xl border text-center cursor-pointer font-bold text-xs transition ${
                        formData.role === 'admin' 
                            ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs' 
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}>
                        <input type="radio" name="role" value="admin" className="hidden" checked={formData.role === 'admin'} onChange={handleChange} />
                        🛡️ એડમિન (Owner)
                    </label>
                </div>

                {formData.role === 'admin' && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold">
                        👑 <strong>Admin Registration Notice:</strong> Enter your mobile number and the authorized master password <code>"yash"</code> to create an Admin/Company Member account.
                    </div>
                )}
                
                <div className="mb-4">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name (પૂરું નામ)</label>
                    <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium" 
                        placeholder={formData.role === 'admin' ? "e.g. Yash Dadhaniya" : "e.g. Ramesh Patel"} 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Mobile Number (મોબાઈલ નંબર)</label>
                    <input 
                        type="tel" 
                        name="mobile" 
                        value={formData.mobile} 
                        onChange={handleChange} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium" 
                        placeholder="e.g. 9876543210" 
                        required 
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Village (ગામનું નામ)</label>
                        <input 
                            type="text" 
                            name="village" 
                            value={formData.village} 
                            onChange={handleChange} 
                            className="w-full p-3 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium" 
                            placeholder="e.g. Manavadar / Buri" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">District (જિલ્લો)</label>
                        <input 
                            type="text" 
                            name="district" 
                            value={formData.district} 
                            onChange={handleChange} 
                            className="w-full p-3 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium" 
                            placeholder="e.g. Junagadh" 
                            required 
                        />
                    </div>
                </div>
                
                {formData.role === 'serviceProvider' && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                        <label className="block text-xs font-bold text-blue-900 mb-2">Select Services Offered (સેવાઓ પસંદ કરો):</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {SERVICES_LIST.map(srv => (
                                <button 
                                    type="button" 
                                    key={srv} 
                                    onClick={() => handleServiceToggle(srv)} 
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                                        formData.services.includes(srv) 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                >
                                    {formData.services.includes(srv) ? '✓ ' : '+ '}{srv}
                                </button>
                            ))}
                        </div>
                        <div className="mb-3">
                            <label className="block text-xs font-bold text-blue-900 mb-1">Vehicle / Equipment Details (વાહન વિગત)</label>
                            <input 
                                type="text" 
                                name="vehicle" 
                                value={formData.vehicle} 
                                onChange={handleChange} 
                                className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-xs font-medium" 
                                placeholder="e.g. Mahindra 575 DI / John Deere" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-900 mb-1">Rate / Pricing (ભાડું)</label>
                            <input 
                                type="text" 
                                name="rate" 
                                value={formData.rate} 
                                onChange={handleChange} 
                                className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-xs font-medium" 
                                placeholder="e.g. ₹500/કલાક અથવા ₹1200/વીઘા" 
                            />
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        {formData.role === 'admin' ? "Admin Master Password (એડમિન પાસવર્ડ: 'yash')" : "Password (પાસવર્ડ)"}
                    </label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium" 
                        placeholder={formData.role === 'admin' ? "Enter 'yash'" : "••••••••"} 
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full font-bold py-3.5 rounded-xl disabled:opacity-50 transition shadow-md text-sm text-white ${
                        formData.role === 'admin' 
                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                            : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                    }`}
                >
                    {loading ? 'Creating Account...' : formData.role === 'admin' ? 'Register as Admin (એડમિન બનાવો) ➔' : 'Register Account (ખાતું બનાવો) ➔'}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 border-t pt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 font-bold hover:underline">
                    Login here (લૉગિન કરો)
                </Link>
            </div>
        </div>
    );
}