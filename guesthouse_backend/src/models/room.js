const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true 
    },
    type: {
        type: String,
        required: true,
        enum: ['Single', 'Double']
    },
    ac: {
        type: Boolean,
        required: true,
        default: false
    },
    price: {
        type: Number,
        required: true
    },
    floor: {
        type: String,
        enum: ['Ground', 'First', 'Second', 'Third'],
        default: 'Ground'
    },
    status: {
        type: String,
        required: true,
        enum: ['available', 'maintenance'],
        default: 'available'
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);