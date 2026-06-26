const { checkRoomAvailability } = require('../utils/availabilityEngine');

// @desc    Query live available room slots and estimate dynamic total pricing
// @route   GET /api/bookings/check-availability
const getLiveAvailability = async (req, res) => {
    try {
        const { startDate, endDate, roomType, acRequired } = req.query;

        // 1. Structural Validation
        if (!startDate || !endDate || !roomType || acRequired === undefined) {
            return res.status(400).json({ message: 'Missing mandatory timeframe or property preferences.' });
        }

        // 2. Clear Date Bounds Check
        const checkIn = new Date(startDate);
        const checkOut = new Date(endDate);

        if (checkIn >= checkOut) {
            return res.status(400).json({ message: 'Validation Error: Check-out date must succeed Check-in date.' });
        }

        // 3. String-to-Boolean Casting for AC Flag
        const isAcRequired = acRequired === 'true';

        // 4. Fire the Overlap Arithmetic Core Engine
        const availabilityMetrics = await checkRoomAvailability(startDate, endDate, roomType, isAcRequired);

        // 5. Dynamic Estimated Price Engine Computation
        // Calculate the difference in time, convert to total days/nights
        const timeDifference = checkOut.getTime() - checkIn.getTime();
        const totalNights = Math.ceil(timeDifference / (1000 * 3600 * 24));

        let estimatedTotalPrice = 0;
        
        // Find a representative room from the matching pool to calculate the current night rate
        if (availabilityMetrics.availableRoomPool.length > 0) {
            const basePricePerNight = availabilityMetrics.availableRoomPool[0].price;
            estimatedTotalPrice = basePricePerNight * totalNights;
        }

        return res.status(200).json({
            success: true,
            timeframe: {
                nightsDetected: totalNights,
                startDate,
                endDate
            },
            metrics: {
                totalRoomsInInventory: availabilityMetrics.totalInventory,
                currentlyBlockedOrLocked: availabilityMetrics.allocatedOrLocked,
                roomsAvailableToBook: availabilityMetrics.roomsRemaining
            },
            estimatedPrice: estimatedTotalPrice,
            isAvailable: availabilityMetrics.roomsRemaining > 0
        });

    } catch (error) {
        res.status(500).json({ error: 'Availability Engine Query Defect', details: error.message });
    }
};

module.exports = { getLiveAvailability };