require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');

const authRoutes = require('./src/routes/authRoutes.js');
const roomRoutes = require('./src/routes/roomRoutes.js');
const bookingRoutes = require('./src/routes/bookingRoutes.js');

const app = express();

const webhookRoutes = require('./src/routes/webhookRoutes.js');
app.use('/api/webhooks', webhookRoutes);

// Database initialization
connectDB();

// Inside your guesthouse_backend/server.js file
// Remove any other app.use(cors()) blocks and put this at the very top of server.js
const cors = require('cors');

app.use(cors({
    origin: 'https://vnit-guest-house-booking-theta.vercel.app', // Explicit single origin string
    credentials: true, // Required for withCredentials: true
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle Preflight OPTIONS requests explicitly before any routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Communication Hub active on port ${PORT} in production mode.`);
});