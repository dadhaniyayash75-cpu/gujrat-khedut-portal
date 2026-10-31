const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// POST /api/reviews - Submit review for completed booking
router.post('/', protect, async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        if (!bookingId || !rating) {
            return res.status(400).json({ success: false, message: 'Booking ID and star rating (1-5) are required' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.receiverId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only the receiver of this service can submit a review' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed services' });
        }

        // Check for duplicate review
        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking' });
        }

        const review = new Review({
            bookingId,
            receiverId: req.user.id,
            providerId: booking.providerId,
            rating: Number(rating),
            comment: comment || ''
        });

        await review.save();

        // Recalculate provider aggregate rating
        const allReviews = await Review.find({ providerId: booking.providerId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await User.findByIdAndUpdate(booking.providerId, {
            rating: parseFloat(avgRating.toFixed(1)),
            ratingCount: allReviews.length
        });

        res.status(201).json({ 
            success: true, 
            message: 'રિવ્યુ અને રેટિંગ સફળતાપૂર્વક સબમિટ થયા (Review submitted successfully)!', 
            data: review 
        });
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ success: false, message: 'Server error submitting review' });
    }
});

// GET /api/reviews/provider/:providerId - Get all reviews for a provider
router.get('/provider/:providerId', async (req, res) => {
    try {
        const reviews = await Review.find({ providerId: req.params.providerId })
            .populate('receiverId', 'fullName village')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching reviews' });
    }
});

module.exports = router;
