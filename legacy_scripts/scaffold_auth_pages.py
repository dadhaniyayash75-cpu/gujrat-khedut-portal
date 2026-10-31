import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

# src/pages/Login.jsx
create_file('client/src/pages/Login.jsx', '''
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function Login() {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { mobile, password });
            login(res.data.user, res.data.token);
            if (res.data.user.role === 'serviceProvider') navigate('/provider-dashboard');
            else navigate('/search-services');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl">
            <h2 className="text-2xl font-black mb-6">Login</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm font-bold">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-xs font-bold mb-1">Mobile Number</label>
                    <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full p-3 rounded-xl border" required />
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-bold mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl border" required />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">Login</button>
            </form>
        </div>
    );
}
''')

# src/pages/Register.jsx
create_file('client/src/pages/Register.jsx', '''
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '', mobile: '', password: '', role: 'serviceReceiver', village: '',
        services: [], vehicle: '', rate: ''
    });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const SERVICES_LIST = ["Tractor", "Harvester", "Rotavator", "Cultivator", "Seed Drill", "Water Tanker", "Agricultural Transport", "Other"];

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleServiceToggle = srv => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(srv) ? prev.services.filter(s => s !== srv) : [...prev.services, srv]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.role === 'serviceProvider' && formData.services.length === 0) {
            return setError('Please select at least one service');
        }
        try {
            const res = await api.post('/auth/register', formData);
            login(res.data.user, res.data.token);
            if (res.data.user.role === 'serviceProvider') navigate('/provider-dashboard');
            else navigate('/search-services');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl mb-12">
            <h2 className="text-2xl font-black mb-6">Create Account</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm font-bold">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-6 flex gap-4">
                    <label className={`flex-1 p-3 rounded-xl border text-center cursor-pointer font-bold ${formData.role === 'serviceReceiver' ? 'bg-green-100 border-green-500 text-green-900' : 'border-slate-200 text-slate-500'}`}>
                        <input type="radio" name="role" value="serviceReceiver" className="hidden" checked={formData.role === 'serviceReceiver'} onChange={handleChange} />
                        🌾 Service Receiver
                    </label>
                    <label className={`flex-1 p-3 rounded-xl border text-center cursor-pointer font-bold ${formData.role === 'serviceProvider' ? 'bg-blue-100 border-blue-500 text-blue-900' : 'border-slate-200 text-slate-500'}`}>
                        <input type="radio" name="role" value="serviceProvider" className="hidden" checked={formData.role === 'serviceProvider'} onChange={handleChange} />
                        🚜 Service Provider
                    </label>
                </div>
                
                <div className="mb-4">
                    <label className="block text-xs font-bold mb-1">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-3 rounded-xl border" required />
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-bold mb-1">Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full p-3 rounded-xl border" required />
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-bold mb-1">Village Name</label>
                    <input type="text" name="village" value={formData.village} onChange={handleChange} className="w-full p-3 rounded-xl border" placeholder="e.g. Gondal" required />
                </div>
                
                {formData.role === 'serviceProvider' && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold mb-2">Select Services</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {SERVICES_LIST.map(srv => (
                                <button type="button" key={srv} onClick={() => handleServiceToggle(srv)} className={`px-2 py-1 text-[10px] font-bold rounded-md border ${formData.services.includes(srv) ? 'bg-blue-600 text-white' : 'bg-white'}`}>{srv}</button>
                            ))}
                        </div>
                        <div className="mb-3">
                            <label className="block text-[10px] font-bold mb-1">Vehicle Details</label>
                            <input type="text" name="vehicle" value={formData.vehicle} onChange={handleChange} className="w-full p-2 rounded-lg border text-xs" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold mb-1">Price/Rate</label>
                            <input type="text" name="rate" value={formData.rate} onChange={handleChange} className="w-full p-2 rounded-lg border text-xs" />
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-xs font-bold mb-1">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 rounded-xl border" required />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">Register</button>
            </form>
        </div>
    );
}
''')

print("Auth pages scaffolded.")
