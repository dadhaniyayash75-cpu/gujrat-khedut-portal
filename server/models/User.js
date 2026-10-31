const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'serviceProvider', 'serviceReceiver'], 
        required: true 
    },
    village: { type: String, required: true },
    district: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [70.8022, 22.3039] } // [longitude, latitude]
    },

    // Service Provider Attributes
    services: [{ type: String }],
    vehicle: { type: String },
    rate: { type: String },
    pricingType: { type: String, default: 'per_hour' },
    photoUrl: { type: String, default: '' },
    isOnline: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0 },
    ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);