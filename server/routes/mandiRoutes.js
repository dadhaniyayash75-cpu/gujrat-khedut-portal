const express = require('express');
const router = express.Router();
const mandiService = require('../services/mandiService');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/mandi/live - Public dynamic live rates
router.get('/live', (req, res) => {
    try {
        const { search } = req.query;
        const data = mandiService.getLiveRates({ search });
        res.json(data);
    } catch (err) {
        console.error('Mandi rate error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch live mandi rates' });
    }
});

// POST /api/mandi/custom-rate - Admin only
router.post('/custom-rate', protect, authorize('admin'), (req, res) => {
    try {
        const { yard_gu, yard_en, crop_gu, crop_en, min, max, unit, arrival } = req.body;
        if (!yard_gu || !crop_gu || !min || !max) {
            return res.status(400).json({ success: false, message: 'Please provide all required rate fields' });
        }
        const newRate = mandiService.addCustomRate({
            yard_gu,
            yard_en: yard_en || yard_gu,
            district: req.body.district || 'Gujarat',
            crop_gu,
            crop_en: crop_en || crop_gu,
            min: min.startsWith('₹') ? min : `₹${min}`,
            max: max.startsWith('₹') ? max : `₹${max}`,
            unit: unit || '20 KG (મણ)',
            arrival: arrival || 'લાઈવ આવક',
            trend: '+10',
            isPositive: true
        });
        res.status(201).json({ success: true, message: 'Custom mandi rate added successfully', data: newRate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
