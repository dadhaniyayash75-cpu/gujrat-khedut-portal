import os

def append_file(path, content):
    with open(path, 'a', encoding='utf-8') as f:
        f.write(content.strip())
        
def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

# routes/authRoutes.js
create_file('server/routes/authRoutes.js', '''
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { fullName, mobile, password, role, village, services, vehicle, rate } = req.body;
        
        let user = await User.findOne({ mobile });
        if (user) return res.status(400).json({ success: false, message: 'User already exists with this mobile number' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user = new User({ fullName, mobile, passwordHash, role, village, services, vehicle, rate });
        await user.save();

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ success: true, token, user: { id: user.id, fullName, role, village } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const user = await User.findOne({ mobile });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token, user: { id: user.id, fullName: user.fullName, role: user.role, village: user.village } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
''')

# routes/serviceRoutes.js
create_file('server/routes/serviceRoutes.js', '''
const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Find all users who are service providers
        const providers = await User.find({ role: 'serviceProvider' }).select('-passwordHash');
        res.json({ success: true, data: providers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
''')

# routes/bookingRoutes.js
create_file('server/routes/bookingRoutes.js', '''
const express = require('express');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Create booking (Receiver only)
router.post('/', protect, authorize('serviceReceiver'), async (req, res) => {
    try {
        const { providerId, service, date, time, message } = req.body;
        const booking = new Booking({
            receiverId: req.user.id,
            providerId,
            service,
            date,
            time,
            message
        });
        await booking.save();
        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get my bookings (Receiver or Provider)
router.get('/my', protect, async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'serviceProvider') {
            bookings = await Booking.find({ providerId: req.user.id }).populate('receiverId', 'fullName mobile village');
        } else {
            bookings = await Booking.find({ receiverId: req.user.id }).populate('providerId', 'fullName mobile village');
        }
        res.json({ success: true, data: bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update booking status (Provider only)
router.put('/:id/status', protect, authorize('serviceProvider'), async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        if (booking.providerId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        
        booking.status = status;
        await booking.save();
        res.json({ success: true, data: booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
''')

print("Routes scaffolded successfully.")
