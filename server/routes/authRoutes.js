const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { geocodeVillage } = require('../services/geocodingService');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yash';

// Auto-seed Default Admin Account if none exists
async function seedDefaultAdmin() {
    try {
        const adminMobile = process.env.ADMIN_MOBILE || '9999999999';
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);
            admin = new User({
                fullName: 'Yash Dadhaniya (Website Owner)',
                mobile: adminMobile,
                passwordHash,
                role: 'admin',
                village: 'Buri',
                district: 'Junagadh',
                location: { type: 'Point', coordinates: [70.7, 22.0] }
            });
            await admin.save();
            console.log(`🛡️ Default Admin account initialized (Mobile: ${adminMobile}, Password: ${ADMIN_PASSWORD})`);
        }
    } catch (e) {
        console.error('Admin auto-seed notice:', e.message);
    }
}
seedDefaultAdmin();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { fullName, mobile, password, role, village, district, services, vehicle, rate, pricingType } = req.body;
        
        if (!fullName || !mobile || !password) {
            return res.status(400).json({ success: false, message: 'કૃપા કરીને બધી જરૂરી વિગતો ભરો (Please provide all required fields).' });
        }

        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        let user = await User.findOne({ mobile: cleanMobile });
        if (user) {
            return res.status(400).json({ success: false, message: 'આ મોબાઈલ નંબર સાથે પહેલેથી જ એકાઉન્ટ છે (Account already exists with this mobile number)' });
        }

        // Admin Security Check: Only allow admin registration if password matches master passcode "yash"
        let userRole = role;
        if (role === 'admin') {
            if (password !== ADMIN_PASSWORD) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'અમાન્ય એડમિન પાસવર્ડ! ફક્ત વેબસાઇટ ઓનર અને કંપની મેમ્બર માટે છે (Invalid Admin Password! Only website owner and company members can register as admin).' 
                });
            }
            userRole = 'admin';
        } else if (role !== 'serviceProvider' && role !== 'serviceReceiver') {
            userRole = 'serviceReceiver';
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        let location = { type: 'Point', coordinates: [70.8022, 22.3039] };
        if (village) {
            const coords = await geocodeVillage(village, district);
            if (coords) {
                location.coordinates = [coords.longitude, coords.latitude];
            }
        }
        
        user = new User({ 
            fullName, 
            mobile: cleanMobile, 
            passwordHash, 
            role: userRole, 
            village: village || 'Gujarat', 
            district: district || 'Gujarat', 
            services: services || [], 
            vehicle: vehicle || '', 
            rate: rate || '', 
            pricingType: pricingType || 'per_hour',
            isOnline: true,
            location 
        });

        await user.save();

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_token_for_khedut_portal', { expiresIn: '15d' });

        res.status(201).json({ 
            success: true, 
            token, 
            user: { 
                id: user.id, 
                fullName: user.fullName, 
                role: user.role, 
                village: user.village,
                mobile: user.mobile,
                isOnline: user.isOnline
            } 
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { mobile, password, selectedRole } = req.body;
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

        const user = await User.findOne({ mobile: cleanMobile });
        if (!user) {
            return res.status(400).json({ success: false, message: 'આ મોબાઈલ નંબરનું એકાઉન્ટ મળ્યું નથી (No account found with this mobile number).' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'તમારું એકાઉન્ટ સસ્પેન્ડ કરવામાં આવ્યું છે (Your account is suspended by administrator).' });
        }

        // If user is trying to login as admin with "yash" master password
        let isMatch = false;
        if (user.role === 'admin' && password === ADMIN_PASSWORD) {
            isMatch = true;
        } else {
            isMatch = await bcrypt.compare(password, user.passwordHash);
        }

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'પાસવર્ડ ખોટો છે (Invalid mobile number or password).' });
        }

        // If user specifically requested Admin role login, ensure they have admin privileges
        if (selectedRole === 'admin' && user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'તમારી પાસે એડમિન અધિકાર નથી (You do not have administrative privileges).' });
        }

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_token_for_khedut_portal', { expiresIn: '15d' });

        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user.id, 
                fullName: user.fullName, 
                role: user.role, 
                village: user.village,
                mobile: user.mobile,
                isOnline: user.isOnline,
                rating: user.rating,
                ratingCount: user.ratingCount
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// GET CURRENT USER (/me)
router.get('/me', protect, async (req, res) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// TOGGLE ONLINE / OFFLINE (For Service Providers)
router.put('/toggle-online', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        user.isOnline = !user.isOnline;
        await user.save();

        res.json({ 
            success: true, 
            message: `You are now ${user.isOnline ? 'Online (સેવા ઉપલબ્ધ)' : 'Offline (વિશ્રામ પર)'}`,
            isOnline: user.isOnline 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;