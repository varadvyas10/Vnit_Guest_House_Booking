const express = require('express');
const router = express.Router();
const { createRoom, getAllRooms, toggleRoomMaintenance } = require('../controllers/roomController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Publicly accessible to any authenticated user to view options
router.get('/', protect, getAllRooms);

// Strict identity gatekeeping applied for mutation requests
router.post('/', protect, authorize('admin', 'superadmin'), createRoom);

router.patch('/toggle-maintenance/:id', protect, authorize('admin', 'superadmin'), toggleRoomMaintenance);

module.exports = router;