const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const smsService = require('../services/smsService');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Helper to push in-app notification and emit socket event
async function sendNotificationAndSocket(req, recipientId, title, message, type, bookingId, socketEvent, socketData) {
    try {
        const notif = await Notification.create({
            userId: recipientId,
            title,
            message,
            type,
            bookingId
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`user_${recipientId}`).emit('notification_received', notif);
            if (socketEvent) {
                io.to(`user_${recipientId}`).emit(socketEvent, socketData);
            }
        }
    } catch (e) {
        console.error('Notification error:', e.message);
    }
}

// 1. CREATE BOOKING / REQUEST SERVICE (Farmer -> Provider)
router.post('/', protect, async (req, res) => {
    try {
        const { providerId, service, date, time, message, receiverLocation, distanceKm, estimatedPrice } = req.body;
        
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'serviceProvider') {
            return res.status(404).json({ success: false, message: 'સર્વિસ પ્રોવાઈડર મળ્યા નથી (Provider not found).' });
        }

        if (provider.isBlocked) {
            return res.status(400).json({ success: false, message: 'આ પ્રોવાઈડરનું એકાઉન્ટ હાલ ઉપલબ્ધ નથી (This provider account is suspended).' });
        }

        const receiver = await User.findById(req.user.id);

        const booking = new Booking({
            receiverId: req.user.id,
            providerId,
            service: service || 'General Farming Service',
            date: date || new Date().toISOString().split('T')[0],
            time: time || 'Morning',
            message: message || 'Need farming equipment service at farm',
            receiverLocation: {
                village: receiverLocation?.village || receiver.village || 'Farm Location',
                district: receiverLocation?.district || receiver.district || '',
                coordinates: receiverLocation?.coordinates || receiver.location?.coordinates || [0, 0]
            },
            providerLocation: {
                village: provider.village,
                district: provider.district,
                coordinates: provider.location?.coordinates || [0, 0]
            },
            distanceKm: distanceKm || 0,
            estimatedPrice: estimatedPrice || provider.rate || '₹500/hr',
            status: 'pending',
            timeline: [
                {
                    status: 'pending',
                    timestamp: new Date(),
                    note: 'ખેડૂત દ્વારા સર્વિસ બુકિંગ રિક્વેસ્ટ મોકલવામાં આવી (Request submitted by farmer)'
                }
            ]
        });

        await booking.save();
        await booking.populate('receiverId', 'fullName mobile village district');
        await booking.populate('providerId', 'fullName mobile village district vehicle rate pricingType');

        // 1. Send SMS Alert to Provider
        smsService.sendNewRequestAlert(provider, receiver, booking).catch(err => console.error(err));

        // 2. Push In-App Notification and Real-Time Socket.IO alert
        await sendNotificationAndSocket(
            req,
            provider._id,
            'નવો સર્વિસ રિક્વેસ્ટ (New Booking Request)!',
            `${receiver.fullName} એ ${booking.service} માટે સર્વિસ રિક્વેસ્ટ મોકલેલ છે. ગામ: ${booking.receiverLocation.village}`,
            'booking_request',
            booking._id,
            'new_booking_request',
            booking
        );

        res.status(201).json({
            success: true,
            message: 'તમારો સર્વિસ રિક્વેસ્ટ પ્રોવાઈડરને મોકલી દેવામાં આવ્યો છે! (Request sent successfully!)',
            data: booking
        });
    } catch (err) {
        console.error('Create booking error:', err);
        res.status(500).json({ success: false, message: 'Server error creating service booking' });
    }
});

// 2. GET SINGLE BOOKING DETAILS (For Live Tracking & Details)
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('receiverId', 'fullName mobile village district location')
            .populate('providerId', 'fullName mobile village district vehicle rate pricingType photoUrl rating ratingCount location isOnline');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'બુકિંગ મળ્યું નથી (Booking not found)' });
        }

        // Only allow receiver, provider, or admin to access
        const isReceiver = booking.receiverId._id.toString() === req.user.id;
        const isProvider = booking.providerId._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isReceiver && !isProvider && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
        }

        res.json({ success: true, data: booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching booking' });
    }
});

// 3. GET MY BOOKINGS (Receiver or Provider)
router.get('/my/all', protect, async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'serviceProvider') {
            bookings = await Booking.find({ providerId: req.user.id })
                .populate('receiverId', 'fullName mobile village district location')
                .sort({ createdAt: -1 });
        } else {
            bookings = await Booking.find({ receiverId: req.user.id })
                .populate('providerId', 'fullName mobile village district vehicle rate pricingType photoUrl rating ratingCount location isOnline')
                .sort({ createdAt: -1 });
        }
        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching bookings' });
    }
});

// Backwards compatibility for /api/bookings/my
router.get('/my', protect, async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'serviceProvider') {
            bookings = await Booking.find({ providerId: req.user.id })
                .populate('receiverId', 'fullName mobile village district location')
                .sort({ createdAt: -1 });
        } else {
            bookings = await Booking.find({ receiverId: req.user.id })
                .populate('providerId', 'fullName mobile village district vehicle rate pricingType photoUrl rating ratingCount location isOnline')
                .sort({ createdAt: -1 });
        }
        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching bookings' });
    }
});

// 4. UPDATE BOOKING STATUS (Uber/Rapido Flow - Provider only)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status, finalPrice, note } = req.body;
        const validStatuses = ['accepted', 'rejected', 'on_the_way', 'arrived', 'service_started', 'completed'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status transition: ${status}` });
        }

        const booking = await Booking.findById(req.params.id)
            .populate('receiverId', 'fullName mobile village district')
            .populate('providerId', 'fullName mobile village district vehicle');

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        if (booking.providerId._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
        }

        // Apply status update & append to timeline
        booking.status = status;
        if (finalPrice) booking.finalPrice = finalPrice;
        
        booking.timeline.push({
            status,
            timestamp: new Date(),
            note: note || `Status updated to ${status}`
        });

        await booking.save();

        // 1. Send SMS Alert to Receiver
        smsService.sendStatusUpdateAlert(booking.receiverId, booking.providerId, booking, status)
            .catch(err => console.error(err));

        // 2. Push In-App Notification and Real-Time Socket.IO event to Receiver
        let notifTitle = 'બુકિંગ સ્ટેટસ અપડેટ (Booking Update)';
        let notifMsg = `તમારું બુકિંગ સ્ટેટસ: ${status}`;
        if (status === 'accepted') {
            notifTitle = 'રિક્વેસ્ટ સ્વીકારવામાં આવી છે (Booking Accepted)!';
            notifMsg = `${booking.providerId.fullName} એ તમારો રિક્વેસ્ટ સ્વીકારી લીધો છે.`;
        } else if (status === 'rejected') {
            notifTitle = 'રિક્વેસ્ટ રદ કરવામાં આવી (Booking Declined)';
            notifMsg = `${booking.providerId.fullName} એ રિક્વેસ્ટ સ્વીકારી શક્યા નથી. કૃપા કરીને અન્ય પ્રોવાઈડર શોધો.`;
        } else if (status === 'on_the_way') {
            notifTitle = 'પ્રોવાઈડર નીકળી ગયા છે (On The Way)!';
            notifMsg = `${booking.providerId.fullName} તમારા ખેતરે આવવા નીકળી ગયા છે.`;
        } else if (status === 'arrived') {
            notifTitle = 'પ્રોવાઈડર ખેતરે પહોંચી ગયા છે (Arrived)!';
            notifMsg = `${booking.providerId.fullName} તમારા ખેતર લોકેશન પર પહોંચી ગયા છે.`;
        } else if (status === 'completed') {
            notifTitle = 'ખેતીકામ પૂર્ણ થયું છે (Work Completed)!';
            notifMsg = `સર્વિસ પૂર્ણ થઈ ગઈ છે. કૃપા કરીને પ્રોવાઈડરને રેટિંગ અને રિવ્યુ આપો.`;
        }

        await sendNotificationAndSocket(
            req,
            booking.receiverId._id,
            notifTitle,
            notifMsg,
            'booking_status',
            booking._id,
            'booking_status_updated',
            { bookingId: booking._id, status, booking }
        );

        res.json({ 
            success: true, 
            message: `Booking status updated to ${status}!`, 
            data: booking 
        });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ success: false, message: 'Server error updating booking status' });
    }
});

// 5. CANCEL BOOKING (Receiver or Provider)
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id)
            .populate('receiverId', 'fullName mobile village district')
            .populate('providerId', 'fullName mobile village district');

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const isReceiver = booking.receiverId._id.toString() === req.user.id;
        const isProvider = booking.providerId._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isReceiver && !isProvider && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: `Cannot cancel a booking that is already ${booking.status}` });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Cancelled by user';
        booking.cancelledBy = req.user.id;
        booking.timeline.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: `Cancelled: ${reason || 'No reason specified'}`
        });

        await booking.save();

        const targetUser = isReceiver ? booking.providerId : booking.receiverId;
        smsService.sendCancellationAlert(targetUser, booking, reason).catch(err => console.error(err));

        await sendNotificationAndSocket(
            req,
            targetUser._id,
            'બુકિંગ રદ કરવામાં આવ્યું (Booking Cancelled)',
            `બુકિંગ #${booking.bookingId} રદ કરવામાં આવ્યું છે. કારણ: ${reason || 'રદ કરેલ છે'}`,
            'booking_cancelled',
            booking._id,
            'booking_status_updated',
            { bookingId: booking._id, status: 'cancelled', booking }
        );

        res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
    } catch (err) {
        console.error('Cancel booking error:', err);
        res.status(500).json({ success: false, message: 'Server error cancelling booking' });
    }
});

module.exports = router;
