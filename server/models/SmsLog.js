const mongoose = require('mongoose');

const SmsLogSchema = new mongoose.Schema({
    mobile: { type: String, required: true },
    message: { type: String, required: true },
    gateway: { 
        type: String, 
        enum: ['twilio', 'msg91', '2factor', 'simulator'], 
        default: 'simulator' 
    },
    status: { 
        type: String, 
        enum: ['sent', 'delivered', 'failed', 'simulated'], 
        default: 'simulated' 
    },
    errorDetails: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SmsLog', SmsLogSchema);
