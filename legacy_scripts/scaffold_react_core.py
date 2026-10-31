import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

# src/api.js
create_file('client/src/api.js', '''
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
''')

# src/context/AuthContext.jsx
create_file('client/src/context/AuthContext.jsx', '''
import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (localStorage.getItem('token')) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.user);
                } catch (err) {
                    console.error(err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
''')

# src/App.jsx
create_file('client/src/App.jsx', '''
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProviderDashboard from './pages/ProviderDashboard';
import SearchServices from './pages/SearchServices';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = React.useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
    return children;
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
                <Navbar />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/provider-dashboard" element={
                            <ProtectedRoute allowedRole="serviceProvider">
                                <ProviderDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/search-services" element={
                            <ProtectedRoute allowedRole="serviceReceiver">
                                <SearchServices />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    </AuthProvider>
  );
}

export default App;
''')

# src/components/Navbar.jsx
create_file('client/src/components/Navbar.jsx', '''
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 backdrop-blur border-b bg-white/95 border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="font-black text-xl text-green-700">🚜 Khedut Portal</Link>
                <nav className="flex gap-4 items-center">
                    <Link to="/" className="font-bold text-slate-700 hover:text-green-600">Home</Link>
                    {user ? (
                        <>
                            {user.role === 'serviceProvider' ? (
                                <Link to="/provider-dashboard" className="font-bold text-slate-700 hover:text-green-600">Dashboard</Link>
                            ) : (
                                <Link to="/search-services" className="font-bold text-slate-700 hover:text-green-600">Find Services</Link>
                            )}
                            <button onClick={handleLogout} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="font-bold text-slate-700 hover:text-green-600">Login</Link>
                            <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
''')

# src/pages/Home.jsx
create_file('client/src/pages/Home.jsx', '''
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-black text-green-800 mb-6">Gujarat Khedut Sahay Portal</h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">Connecting farmers with agricultural service providers within 20km radius.</p>
            
            <div className="flex justify-center gap-6">
                <Link to="/search-services" className="bg-green-600 text-white px-8 py-4 rounded-xl font-black shadow-lg hover:bg-green-700 hover:-translate-y-1 transition transform">
                    Find Farming Services
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition transform">
                    Provide Services
                </Link>
            </div>
        </div>
    );
}
''')

print("React core files scaffolded.")
