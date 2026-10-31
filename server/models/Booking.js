const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingId: { 
        type: String, 
        unique: true, 
        default: () => 'GKP-' + Math.floor(100000 + Math.random() * 900000) 
    },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    message: { type: String, default: 'Need farming equipment service' },
    
    receiverLocation: {
        village: { type: String },
        district: { type: String },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    providerLocation: {
        village: { type: String },
        district: { type: String },
        coordinates: { type: [Number], default: [0, 0] }
    },
    
    distanceKm: { type: Number, default: 0 },
    estimatedPrice: { type: String },
    finalPrice: { type: String },
    
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'on_the_way', 'arrived', 'service_started', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    cancellationReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    timeline: [
        {
            status: { type: String },
            timestamp: { type: Date, default: Date.now },
            note: { type: String }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);