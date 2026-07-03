const express = require('express');
const router = express.Router();
const { 
    getLiveAvailability, 
    initializeBookingHold, 
    getPendingApprovals, 
    allocatePhysicalRoom, 
    getStudentBookings, 
    confirmStripeSession,
    getAllBookings,
    rejectBookingWithReason,
    submitStayReview
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Student & Shared Route Paths
router.get('/check-availability', protect, getLiveAvailability);
router.post('/initialize-hold', protect, initializeBookingHold);
router.get('/my-reservations', protect, getStudentBookings);
router.post('/confirm-session', protect, confirmStripeSession);

// Strict Admin-Only Guarded Operations Channels
router.get('/', protect, authorize('admin', 'superadmin'), getAllBookings); //GET /api/bookings
router.get('/pending-approvals', protect, authorize('admin', 'superadmin'), getPendingApprovals);
router.patch('/allocate/:id', protect, authorize('admin', 'superadmin'), allocatePhysicalRoom);
router.patch('/reject/:id', protect, authorize('admin', 'superadmin'), rejectBookingWithReason); // PATCH /api/bookings/reject/:id
router.post('/:id/review', protect, submitStayReview);


module.exports = router;