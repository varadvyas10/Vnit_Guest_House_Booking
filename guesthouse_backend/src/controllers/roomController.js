const Room = require('../models/Room');

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

module.exports = { createRoom, getAllRooms };