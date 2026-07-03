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

const allowedOrigins = [
    'http://localhost:5173',
    'https://vnit-guest-house-booking-theta.vercel.app' //  Your exact live Vercel origin from the error log
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, //  Critical for handling secure state cookies/JWTs
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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