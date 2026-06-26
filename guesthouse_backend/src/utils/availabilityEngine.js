const Booking = require('../models/Booking');
const Room = require('../models/Room');

 
 // Finds all room nodes that are actively blocked or locked during a specific date window
 
const checkRoomAvailability = async (startDate, endDate, roomType, acRequired) => {
    const checkIn = new Date(startDate);
    const checkOut = new Date(endDate);

    // 1. Fetch total physical room inventory matching the core structural preferences
    const totalMatchingRooms = await Room.find({
        type: roomType,
        ac: acRequired,
        status: 'available' // Excludes units down for repairs/maintenance
    });

    const totalRoomCount = totalMatchingRooms.length;

    // 2. Find all active bookings or temporal locks that intersect the targeted timeframe
    const conflictingBookings = await Booking.find({
        'timeFrame.startDate': { $lt: checkOut },
        'timeFrame.endDate': { $gt: checkIn },
        status: { $in: ['awaiting_approval', 'allocated', 'pending_payment'] } 
    }).populate('assignedRoomId');

    // 3. Filter down conflicts that strictly match the requested physical specifications
    // This handles both pre-allocated rooms and requests still floating in the approval queue
    const blockedBookings = conflictingBookings.filter(booking => {
        if (booking.assignedRoomId) {
            return booking.assignedRoomId.type === roomType && booking.assignedRoomId.ac === acRequired;
        }
        return booking.roomDetails.roomType === roomType && booking.roomDetails.acRequired === acRequired;
    });

    const bookedCount = blockedBookings.length;
    const availableCount = Math.max(0, totalRoomCount - bookedCount);

    return {
        totalInventory: totalRoomCount,
        allocatedOrLocked: bookedCount,
        roomsRemaining: availableCount,
        availableRoomPool: totalMatchingRooms
    };
};

module.exports = { checkRoomAvailability };