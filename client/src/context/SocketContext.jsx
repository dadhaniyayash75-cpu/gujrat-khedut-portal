import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [liveNotification, setLiveNotification] = useState(null);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace('/api', '') 
            : 'http://localhost:5000';

        const newSocket = io(backendUrl, {
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);

        if (user && user.id) {
            newSocket.emit('join_user_room', user.id);
        }

        newSocket.on('notification_received', (notif) => {
            setLiveNotification(notif);
            setTimeout(() => setLiveNotification(null), 6000);
        });

        newSocket.on('new_booking_request', (booking) => {
            setLiveNotification({
                title: '🚜 નવો સર્વિસ રિક્વેસ્ટ!',
                message: `${booking.receiverId?.fullName || 'ખેડૂત'} એ ${booking.service} માટે ઓર્ડર આપેલ છે.`
            });
            setTimeout(() => setLiveNotification(null), 7000);
        });

        newSocket.on('booking_status_updated', (data) => {
            setLiveNotification({
                title: '⚡ બુકિંગ સ્ટેટસ અપડેટ!',
                message: `તમારું બુકિંગ હવે "${data.status}" સ્ટેટસ પર છે.`
            });
            setTimeout(() => setLiveNotification(null), 6000);
        });

        return () => newSocket.close();
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, liveNotification, setLiveNotification }}>
            {liveNotification && (
                <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-green-500/50 flex items-start gap-3 max-w-sm animate-bounce">
                    <span className="text-2xl">🔔</span>
                    <div>
                        <h4 className="font-black text-sm text-amber-300">{liveNotification.title}</h4>
                        <p className="text-xs text-slate-200 mt-0.5">{liveNotification.message}</p>
                    </div>
                </div>
            )}
            {children}
        </SocketContext.Provider>
    );
};
