const express = require('express');
const router = express.Router();
const { getLiveAvailability } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

// Route parameters setup
router.get('/check-availability', protect, getLiveAvailability);

module.exports = router;