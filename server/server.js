require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const mandiRoutes = require('./routes/mandiRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO Setup with CORS
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Attach io to express app so routes can broadcast events
app.set('io', io);

// Real-Time Socket Connection Handling
io.on('connection', (socket) => {
    // User joins their private room based on userId
    socket.on('join_user_room', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
        }
    });

    socket.on('disconnect', () => {
        // Disconnected gracefully
    });
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false // Allows map tiles & external fonts to load cleanly
}));
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mandi', mandiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Gujarat Khedut Portal API is operational' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Gujarat Khedut Portal Server running on port ${PORT}`));