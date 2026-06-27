const express = require('express');
const router = express.Router();
const { getLiveAvailability, initializeBookingHold,getPendingApprovals, 
    allocatePhysicalRoom } = require('../controllers/bookingController');
const { protect , authorize} = require('../middlewares/authMiddleware');

// Route parameters setup
router.get('/check-availability', protect, getLiveAvailability);
router.post('/initialize-hold', protect, initializeBookingHold);

// Strict Admin-Only Guarded Allocations Channels
router.get('/pending-approvals', protect, authorize('admin', 'superadmin'), getPendingApprovals);
router.patch('/allocate/:id', protect, authorize('admin', 'superadmin'), allocatePhysicalRoom);

module.exports = router;