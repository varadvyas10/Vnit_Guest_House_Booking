
const Room = require("../models/room")

// @desc    Add a single new room node to the database (Admin Guarded)
// @route   POST /api/rooms
const createRoom = async (req, res) => {
    try {
        const { roomNumber, type, ac, price, floor, status } = req.body;

        if (!roomNumber || !type || price === undefined) {
            return res.status(400).json({ message: 'Missing core room structural parameters.' });
        }

        const roomExists = await Room.findOne({ roomNumber: roomNumber.toUpperCase() });
        if (roomExists) {
            return res.status(400).json({ message: `Inventory Conflict: Room ${roomNumber} already registered.` });
        }

        const newRoom = await Room.create({
            roomNumber,
            type,
            ac,
            price,
            floor,
            status
        });

        return res.status(201).json({
            success: true,
            message: 'Room inventory node added successfully.',
            room: newRoom
        });
    } catch (error) {
        res.status(500).json({ error: 'Inventory Engine Write Defect', details: error.message });
    }
};

// @desc    Get all registered inventory units sorted by room number
// @route   GET /api/rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({}).sort({ roomNumber: 1 });
        return res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });
    } catch (error) {
        res.status(500).json({ error: 'Inventory Engine Fetch Defect', details: error.message });
    }
};


// @desc    Toggle a room asset between operational and maintenance modes
// @route   PATCH /api/rooms/toggle-maintenance/:id
const toggleRoomMaintenance = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Target room asset not found.' });
        }

        // Flip status smoothly between available and maintenance
        room.status = room.status === 'maintenance' ? 'available' : 'maintenance';
        await room.save();

        return res.status(200).json({ 
            success: true, 
            message: `Room ${room.roomNumber} status successfully updated to ${room.status}.`, 
            room 
        });
    } catch (error) {
        res.status(500).json({ error: 'Maintenance write mutation failed', details: error.message });
    }
};

module.exports = { 
    createRoom, 
    getAllRooms, 
   toggleRoomMaintenance
};