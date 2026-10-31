import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { getWhatsAppUrl, handleCallClick, getFormattedPhoneNumber } from '../utils/phoneUtils';

// Leaflet custom icons
const farmIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const tractorIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const STATUS_STEPS = [
    { key: 'pending', label: 'રિક્વેસ્ટ મોકલાઈ (Sent)', icon: '📝' },
    { key: 'accepted', label: 'સ્વીકાર કર્યો (Accepted)', icon: '🤝' },
    { key: 'on_the_way', label: 'રસ્તામાં છે (On The Way)', icon: '🚜' },
    { key: 'arrived', label: 'ખેતરે પહોંચ્યા (Arrived)', icon: '📍' },
    { key: 'service_started', label: 'કામ ચાલુ (In Progress)', icon: '⚙️' },
    { key: 'completed', label: 'પૂર્ણ થયું (Completed)', icon: '✅' }
];

export default function TrackBooking() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext) || {};

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copyNotif, setCopyNotif] = useState(null);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewed, setReviewed] = useState(false);

    // Cancel Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const fetchBooking = async () => {
        try {
            const res = await api.get(`/bookings/${bookingId}`);
            if (res.data.success) {
                setBooking(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'બુકિંગ વિગતો મળી નથી');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    // Real-Time Socket.IO Listener for instant updates without page refresh
    useEffect(() => {
        if (!socket) return;
        const handleStatusUpdate = (data) => {
            if (data.bookingId === bookingId || data.booking?._id === bookingId) {
                fetchBooking();
            }
        };
        socket.on('booking_status_updated', handleStatusUpdate);
        return () => {
            socket.off('booking_status_updated', handleStatusUpdate);
        };
    }, [socket, bookingId]);

    const handleCall = (e, mobile, name) => {
        handleCallClick(e, mobile, name);
        setCopyNotif(`કૉલ નંબર: ${getFormattedPhoneNumber(mobile)}`);
        setTimeout(() => setCopyNotif(null), 4000);
    };

    const handleCancelBooking = async () => {
        setCancelling(true);
        try {
            const res = await api.put(`/bookings/${bookingId}/cancel`, { reason: cancelReason });
            if (res.data.success) {
                setBooking(res.data.data);
                setShowCancelModal(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel');
        } finally {
            setCancelling(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await api.post('/reviews', {
                bookingId: booking._id,
                rating,
                comment
            });
            if (res.data.success) {
                setReviewed(true);
                setShowReviewModal(false);
                fetchBooking();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center">
                <div className="animate-spin text-4xl mb-4">🚜</div>
                <p className="text-slate-600 font-bold text-sm">લાઈવ બુકિંગ ટ્રેકિંગ લોડ થઈ રહ્યું છે...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-3xl shadow-lg text-center">
                <span className="text-4xl">⚠️</span>
                <h3 className="text-lg font-black mt-2 text-slate-800">{error || 'બુકિંગ મળ્યું નથી'}</h3>
                <Link to="/search-services" className="mt-4 inline-block bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                    નવી સર્વિસ શોધો
                </Link>
            </div>
        );
    }

    // Determine current step index
    const currentStatus = booking.status;
    const isCancelled = currentStatus === 'cancelled';
    const isRejected = currentStatus === 'rejected';
    const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);

    // Map Coordinates
    const farmCoords = booking.receiverLocation?.coordinates?.length === 2 && booking.receiverLocation.coordinates[0] !== 0
        ? [booking.receiverLocation.coordinates[1], booking.receiverLocation.coordinates[0]]
        : [21.50, 70.13];

    const providerCoords = booking.providerLocation?.coordinates?.length === 2 && booking.providerLocation.coordinates[0] !== 0
        ? [booking.providerLocation.coordinates[1], booking.providerLocation.coordinates[0]]
        : [21.75, 70.62];

    const mapCenter = [
        (farmCoords[0] + providerCoords[0]) / 2,
        (farmCoords[1] + providerCoords[1]) / 2
    ];

    const isFarmer = user?.id === booking.receiverId?._id;
    const isProvider = user?.id === booking.providerId?._id;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {copyNotif && (
                <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce">
                    📞 {copyNotif}
                </div>
            )}

            {/* Header Status Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 text-xs font-black uppercase px-2.5 py-0.5 rounded-full">
                                Booking #{booking.bookingId}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                                {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 mt-1">
                            {booking.service} Service
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            📍 {booking.receiverLocation?.village || 'ખેતર'}, {booking.receiverLocation?.district || 'ગુજરાત'}
                        </p>
                    </div>

                    <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase inline-block ${
                            currentStatus === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                            currentStatus === 'on_the_way' ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse' :
                            currentStatus === 'accepted' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            currentStatus === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                            ● {currentStatus.replace('_', ' ')}
                        </span>
                        <div className="text-lg font-black text-slate-900 mt-1">
                            {booking.finalPrice || booking.estimatedPrice || '₹500/hr'}
                        </div>
                    </div>
                </div>

                {/* UBER / RAPIDO TIMELINE STEPPER */}
                {!isCancelled && !isRejected ? (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                            {STATUS_STEPS.map((step, idx) => {
                                const isPassed = currentStepIndex >= idx;
                                const isCurrent = currentStepIndex === idx;
                                return (
                                    <div 
                                        key={step.key} 
                                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                                            isCurrent 
                                                ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105' 
                                                : isPassed 
                                                ? 'bg-green-50 text-green-800 border-green-200' 
                                                : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                                        }`}
                                    >
                                        <span className="text-xl mb-1">{step.icon}</span>
                                        <span className="text-[11px] font-black leading-tight">{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold">
                        ⚠️ આ બુકિંગ રદ કરવામાં આવ્યું છે (Cancelled / Declined). કારણ: {booking.cancellationReason || 'રદ કરેલ છે'}
                    </div>
                )}
            </div>

            {/* Main Content Grid: Map & Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 2 Cols: Interactive Leaflet Map */}
                <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[380px]">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-sm text-slate-800">Live Location Map (નકશો)</h3>
                            <p className="text-[11px] text-slate-400">
                                અંતર: આશરે <strong>{booking.distanceKm || 12} KM</strong> • ETA: આશરે <strong>20-30 મિનિટ</strong>
                            </p>
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            GPS Active
                        </span>
                    </div>

                    <div className="flex-1 w-full min-h-[340px]">
                        <MapContainer center={mapCenter} zoom={10} scrollWheelZoom={false} style={{ height: '340px', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {/* Farm Marker */}
                            <Marker position={farmCoords} icon={farmIcon}>
                                <Popup>
                                    <div className="text-xs font-bold">
                                        🌾 ખેતર લોકેશન (Farm Location)<br/>
                                        ગામ: {booking.receiverLocation?.village || 'Farm'}
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Equipment / Provider Marker */}
                            <Marker position={providerCoords} icon={tractorIcon}>
                                <Popup>
                                    <div className="text-xs font-bold">
                                        🚜 {booking.providerId?.fullName || 'Provider'}<br/>
                                        વાહન: {booking.providerId?.vehicle || 'Equipment'}
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>

                {/* 1 Col: Provider/Customer Info & Actions */}
                <div className="space-y-6">
                    {/* Provider / Customer Details Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {isFarmer ? "તમારા સર્વિસ પ્રોવાઈડર (Provider)" : "ગ્રાહક ખેડૂત (Customer)"}
                        </span>
                        
                        <div className="mt-3 flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white text-2xl flex items-center justify-center shadow-sm font-black flex-shrink-0">
                                {isFarmer ? "🚜" : "🌾"}
                            </div>
                            <div>
                                <h4 className="font-black text-base text-slate-900">
                                    {isFarmer ? booking.providerId?.fullName : booking.receiverId?.fullName}
                                </h4>
                                <p className="text-xs text-slate-500">
                                    📍 {isFarmer ? booking.providerLocation?.village : booking.receiverLocation?.village}
                                </p>
                                {isFarmer && booking.providerId?.rating && (
                                    <div className="text-xs text-amber-500 font-bold mt-0.5">
                                        ★ {booking.providerId.rating} ({booking.providerId.ratingCount || 0} reviews)
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Buttons (Call & WhatsApp) */}
                        <div className="mt-6 grid grid-cols-2 gap-2">
                            {/* Call Button */}
                            <button
                                onClick={(e) => handleCall(
                                    e, 
                                    isFarmer ? booking.providerId?.mobile : booking.receiverId?.mobile, 
                                    isFarmer ? booking.providerId?.fullName : booking.receiverId?.fullName
                                )}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                            >
                                <span>📞</span> કૉલ કરો
                            </button>

                            {/* WhatsApp Button */}
                            <a
                                href={getWhatsAppUrl(
                                    isFarmer ? booking.providerId?.mobile : booking.receiverId?.mobile,
                                    `નમસ્તે, ગુજરાત ખેડૂત પોર્ટલ બુકિંગ #${booking.bookingId} (${booking.service}) બાબતે સંપર્ક કરું છું.`
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                            >
                                <span>💬</span> WhatsApp
                            </a>
                        </div>

                        {/* Work Schedule */}
                        <div className="mt-6 pt-4 border-t border-slate-100 text-xs space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>તારીખ:</span>
                                <strong className="text-slate-900">{booking.date}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>સમય:</span>
                                <strong className="text-slate-900">{booking.time}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>વાહન / સાધન:</span>
                                <strong className="text-slate-900">{booking.providerId?.vehicle || 'Equipment'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Completion / Review Banner */}
                    {currentStatus === 'completed' && isFarmer && (
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-6 shadow-md">
                            <h4 className="font-black text-base">કામ પૂર્ણ થયું છે! 🎉</h4>
                            <p className="text-xs text-amber-100 mt-1">
                                કૃપા કરીને પ્રોવાઈડરની કામગીરીનું રેટિંગ અને પ્રતિસાદ આપો.
                            </p>
                            {!reviewed ? (
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className="mt-4 bg-white text-amber-900 font-black py-2.5 px-4 rounded-xl text-xs hover:bg-amber-50 shadow-sm transition"
                                >
                                    ★ રેટિંગ અને રિવ્યુ આપો ➔
                                </button>
                            ) : (
                                <span className="mt-4 inline-block bg-white/20 px-3 py-1 rounded-xl text-xs font-bold">
                                    ✓ તમારો રિવ્યુ સબમિટ થઈ ગયો છે
                                </span>
                            )}
                        </div>
                    )}

                    {/* Cancellation Action (Only if pending or accepted) */}
                    {(currentStatus === 'pending' || currentStatus === 'accepted') && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="w-full text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 py-3 rounded-2xl text-xs font-bold transition"
                        >
                            🚫 રિક્વેસ્ટ રદ કરો (Cancel Request)
                        </button>
                    )}
                </div>
            </div>

            {/* REVIEW MODAL */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800">પ્રોવાઈડરને રેટિંગ આપો</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {booking.providerId?.fullName} સાથેનો તમારો અનુભવ કેવો રહ્યો?
                        </p>

                        <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                            {/* 5-Star Selector */}
                            <div className="flex justify-center gap-2 py-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-3xl transition ${rating >= star ? 'text-amber-400 transform scale-110' : 'text-slate-200'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">તમારો પ્રતિસાદ / મંતવ્ય (Review)</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="દા.ત. સમયસર ટ્રેક્ટર પહોંચ્યું અને ઘણું સારું કામ કર્યું..."
                                    rows={3}
                                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-black shadow-sm"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review ➔'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CANCEL MODAL */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800">બુકિંગ રદ કરવાની પુષ્ટિ</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            શું તમે ખરેખર આ બુકિંગ રદ કરવા માંગો છો?
                        </p>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">રદ કરવાનું કારણ (Reason)</label>
                                <input
                                    type="text"
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                    placeholder="દા.ત. અન્ય ટ્રેક્ટર મળી ગયું છે / પ્લાન બદલાઈ ગયો"
                                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold"
                                >
                                    પાછા જાઓ
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelBooking}
                                    disabled={cancelling}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-black shadow-sm"
                                >
                                    {cancelling ? 'Cancelling...' : 'હા, રદ કરો ➔'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
