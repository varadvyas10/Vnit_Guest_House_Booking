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


const allowedOrigins = [
    'https://vnit-guest-house-booking-theta.vercel.app',
    'http://localhost:5173',
];

app.use(cors({
    origin: function (origin, callback) {
        // allow non-browser requests (Postman, server-to-server, curl)
        if (!origin) return callback(null, true);

        const isAllowed =
            allowedOrigins.includes(origin) ||
            /^https:\/\/vnit-guest-house-booking(-[a-z0-9]+)*\.vercel\.app$/.test(origin);

        if (isAllowed) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Communication Hub active on port ${PORT} in production mode.`);
});