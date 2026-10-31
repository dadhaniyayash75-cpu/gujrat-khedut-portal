const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: String },
    village: { type: String, required: true },
    availability: { type: String, default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);