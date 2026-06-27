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


// Global Request Pipeline Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Communication Hub active on port ${PORT} in production mode.`);
});