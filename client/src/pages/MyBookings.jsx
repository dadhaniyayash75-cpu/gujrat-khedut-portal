import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { getFormattedPhoneNumber } from '../utils/phoneUtils';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyBookings = async () => {
        try {
            const res = await api.get('/bookings/my');
            if (res.data.success) {
                setBookings(res.data.data || []);
            }
        } catch (err) {
            console.error('Fetch bookings error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBookings();
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">My Service Bookings (મારા બુકિંગ્સ)</h1>
                    <p className="text-xs text-slate-500">Track and manage all your agricultural equipment requests</p>
                </div>
                <Link
                    to="/search-services"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
                >
                    + Book New Equipment (નવું બુકિંગ)
                </Link>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm font-bold">
                    બુકિંગ હિસ્ટ્રી લોડ થઈ રહી છે...
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                    <span className="text-5xl">🌾</span>
                    <h3 className="text-lg font-black text-slate-800 mt-3">હજુ સુધી કોઈ સર્વિસ બુક કરેલ નથી</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        તમારા ગામની આસપાસના ટ્રેક્ટર, હાર્વેસ્ટર કે રોટાવેટર પ્રોવાઈડર શોધો અને એક ક્લિકમાં ઓર્ડર કરો.
                    </p>
                    <Link
                        to="/search-services"
                        className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition"
                    >
                        🚜 સર્વિસ પ્રોવાઈડર શોધો (Find Providers) ➔
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(b => (
                        <div 
                            key={b._id} 
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 text-2xl flex items-center justify-center font-black flex-shrink-0">
                                    🚜
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-base text-slate-900">{b.service}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                            b.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            b.status === 'on_the_way' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                            b.status === 'accepted' ? 'bg-indigo-100 text-indigo-800' :
                                            b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            ● {b.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        પ્રોવાઈડર: <strong>{b.providerId?.fullName || 'Provider'}</strong> ({b.providerId?.vehicle || 'Equipment'})
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        તારીખ: {b.date} ({b.time}) • બુકિંગ #{b.bookingId}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                                <div className="text-left sm:text-right">
                                    <div className="text-xs text-slate-400 font-semibold">અંદાજિત રકમ</div>
                                    <div className="text-base font-black text-slate-900">{b.finalPrice || b.estimatedPrice || '₹500/hr'}</div>
                                </div>

                                <Link
                                    to={`/track/${b._id}`}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                                >
                                    <span>📍</span> Live Track ➔
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
