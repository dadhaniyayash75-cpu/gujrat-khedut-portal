import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProviderDashboard from './pages/ProviderDashboard';
import SearchServices from './pages/SearchServices';
import AdminDashboard from './pages/AdminDashboard';
import TrackBooking from './pages/TrackBooking';
import MyBookings from './pages/MyBookings';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = React.useContext(AuthContext);
    if (loading) {
        return (
            <div className="p-12 text-center text-slate-500 font-bold text-sm">
                ચકાસણી થઈ રહી છે (Loading authorization)...
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
    return children;
};

function App() {
  return (
    <AuthProvider>
        <SocketProvider>
            <Router>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Service Provider Routes */}
                            <Route path="/provider-dashboard" element={
                                <ProtectedRoute allowedRole="serviceProvider">
                                    <ProviderDashboard />
                                </ProtectedRoute>
                            } />

                            {/* Service Receiver (Farmer) Routes */}
                            <Route path="/search-services" element={
                                <ProtectedRoute allowedRole="serviceReceiver">
                                    <SearchServices />
                                </ProtectedRoute>
                            } />
                            <Route path="/my-bookings" element={
                                <ProtectedRoute allowedRole="serviceReceiver">
                                    <MyBookings />
                                </ProtectedRoute>
                            } />

                            {/* Live Uber Tracking (Both Farmer & Provider) */}
                            <Route path="/track/:bookingId" element={
                                <ProtectedRoute>
                                    <TrackBooking />
                                </ProtectedRoute>
                            } />

                            {/* ADMIN ONLY ROUTES (Strictly Private to Website Owner & Company Members) */}
                            <Route path="/admin/dashboard" element={
                                <ProtectedRoute allowedRole="admin">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/database" element={
                                <ProtectedRoute allowedRole="admin">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />

                            {/* Catch-all fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </SocketProvider>
    </AuthProvider>
  );
}

export default App;