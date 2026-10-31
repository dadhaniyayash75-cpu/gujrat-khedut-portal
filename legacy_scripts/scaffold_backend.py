import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

# server.js
create_file('server/server.js', '''
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
''')

# config/db.js
create_file('server/config/db.js', '''
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gujarat_khedut_portal');
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
module.exports = connectDB;
''')

# .env
create_file('server/.env', '''
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/gujarat_khedut_portal
JWT_SECRET=super_secret_jwt_token_for_khedut_portal
''')

# models/User.js
create_file('server/models/User.js', '''
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['serviceProvider', 'serviceReceiver'], required: true },
    village: { type: String, required: true },
    services: [{ type: String }],
    vehicle: { type: String },
    rate: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
''')

# models/Service.js
create_file('server/models/Service.js', '''
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
''')

# models/Booking.js
create_file('server/models/Booking.js', '''
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
''')

# middleware/authMiddleware.js
create_file('server/middleware/authMiddleware.js', '''
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    
    try {
        if (token.startsWith('Bearer ')) token = token.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: `User role ${req.user.role} is not authorized` });
        }
        next();
    };
};
''')

print("Backend scaffolded successfully.")
