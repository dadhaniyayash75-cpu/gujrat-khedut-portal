const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const SmsLog = require('../models/SmsLog');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/authMiddleware');

// Strictly protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// 1. GET STATS & OVERVIEW
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProviders = await User.countDocuments({ role: 'serviceProvider' });
        const totalReceivers = await User.countDocuments({ role: 'serviceReceiver' });
        const activeProviders = await User.countDocuments({ role: 'serviceProvider', isOnline: true });
        
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const activeBookings = await Booking.countDocuments({ status: { $in: ['accepted', 'on_the_way', 'arrived', 'service_started'] } });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        
        const totalSmsLogs = await SmsLog.countDocuments();
        const totalReviews = await Review.countDocuments();

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProviders,
                totalReceivers,
                activeProviders,
                totalBookings,
                pendingBookings,
                activeBookings,
                completedBookings,
                totalSmsLogs,
                totalReviews
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching admin stats' });
    }
});

// 2. GET ALL USERS (Database Viewer - Admin only)
router.get('/users', async (req, res) => {
    try {
        const { search, role } = req.query;
        let query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { village: { $regex: search, $options: 'i' } },
                { district: { $regex: search, $options: 'i' } },
                { vehicle: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query, '-passwordHash').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error fetching users' });
    }
});

// 3. BLOCK / UNBLOCK USER
router.put('/users/:id/block', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot block an admin account' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ 
            success: true, 
            message: `User "${user.fullName}" is now ${user.isBlocked ? 'Blocked (ખાતું સસ્પેન્ડ કર્યું)' : 'Unblocked (ખાતું સક્રિય કર્યું)'}`, 
            user 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 4. DELETE USER PERMANENTLY
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete an admin account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: `User "${user.fullName}" (${user.mobile}) deleted permanently from database` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error deleting user' });
    }
});

// 5. GET ALL BOOKINGS PLATFORM-WIDE
router.get('/bookings', async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('receiverId', 'fullName mobile village district')
            .populate('providerId', 'fullName mobile village district vehicle')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching bookings' });
    }
});

// 6. GET SMS NOTIFICATION LOGS
router.get('/sms-logs', async (req, res) => {
    try {
        const logs = await SmsLog.find().sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching SMS logs' });
    }
});

module.exports = router;
