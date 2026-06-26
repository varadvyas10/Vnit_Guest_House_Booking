const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guestDetails: {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        occupation: { type: String, trim: true },
        idProofUrl: { type: String } 
    },
    roomDetails: {
        roomType: { 
            type: String, 
            enum: ['Single', 'Double'], 
            required: true 
        },
        acRequired: { type: Boolean, required: true, default: false },
        floorPreference: { 
            type: String, 
            enum: ['Ground', 'First', 'Second', 'Third'], 
            default: 'Ground' 
        }
    },
    timeFrame: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
    },
    financials: {
        stripeSessionId: { type: String, unique: true, sparse: true }, // Sparse allows multiple nulls for uninitiated checkouts
        totalPrice: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'hold_lock', 'paid', 'refunded'],
            default: 'unpaid'
        }
    },
    status: {
        type: String,
        enum: ['pending_payment', 'awaiting_approval', 'allocated', 'rejected', 'expired'],
        default: 'pending_payment'
    },
    assignedRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        default: null
    },
    expiresAt: {
        type: Date,
        default: null // Used for the 5-minute temporal lock countdown
    }
}, { timestamps: true });

// THE PRODUCTION POWERMOVE: A TTL (Time-To-Live) Index
// This database constraint tells MongoDB to scan this collection automatically.
// If a document has a status of 'pending_payment' and the current time crosses 'expiresAt',
// MongoDB will drop or handle the document natively.

bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Booking', bookingSchema);