const Booking = require('../models/Booking');
const stripe = require('../config/stripe');
const { checkRoomAvailability } = require('../utils/availabilityEngine');
const Room = require('../models/Room');

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

// @desc    Initialize a temporal booking reservation hold and yield a live Stripe session URL
// @route   POST /api/bookings/initialize-hold
const initializeBookingHold = async (req, res) => {
    try {
        const { guestName, guestPhone, guestOccupation, roomType, acRequired, floorPreference, startDate, endDate } = req.body;

        // 1. Structural Parameter Check
        if (!guestName || !guestPhone || !roomType || acRequired === undefined || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing core guest profile or reservation specs.' });
        }

        // 2. Clear Date Verification Bounds
        const checkIn = new Date(startDate);
        const checkOut = new Date(endDate);
        if (checkIn >= checkOut) {
            return res.status(400).json({ message: 'Check-out date must succeed check-in date.' });
        }

        // 3. Final Race-Condition Checkpoint
        const availability = await checkRoomAvailability(startDate, endDate, roomType, acRequired === true);
        if (availability.roomsRemaining <= 0) {
            return res.status(400).json({ 
                message: 'Inventory Exhausted: The requested room tier was locked by another user while you were configuring your window.' 
            });
        }

        // 4. Compute Billing Rates
        const totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
        const pricePerNight = availability.availableRoomPool[0].price;
        const computedTotalPrice = pricePerNight * totalNights;

        // 5. Establish the 5-Minute Temporal Database Lock Node
        // Date.now() + 5 minutes in milliseconds
        const lockExpirationWindow = new Date(Date.now() + 5 * 60 * 1000); 

        const dynamicHoldBooking = await Booking.create({
            userId: req.user._id, // Gathered straight from our protect middleware auth token
            guestDetails: { name: guestName, phone: guestPhone, occupation: guestOccupation },
            roomDetails: { roomType, acRequired: acRequired === true, floorPreference },
            timeFrame: { startDate: checkIn, endDate: checkOut },
            financials: { totalPrice: computedTotalPrice, paymentStatus: 'hold_lock' },
            status: 'pending_payment',
            expiresAt: lockExpirationWindow
        });

        // 6. Generate Stripe Secure Checkout Session Pipeline
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            // Replace these with your actual local/production frontend success and cancel routing paths later
            success_url: `http://localhost:5173/booking/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/booking/cancel`,
            customer_email: req.user.email,
            client_reference_id: dynamicHoldBooking._id.toString(), // Crucial link node for the coming webhooks!
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `VNIT Guest House: ${roomType} Room (${acRequired ? 'AC' : 'Non-AC'})`,
                            description: `Stay Reservation across ${totalNights} Nights (${startDate} to ${endDate}) for Guest: ${guestName}`,
                        },
                        unit_amount: computedTotalPrice * 100, // Stripe processes currency strictly in lowest denominations (Paise/Cents)
                    },
                    quantity: 1,
                },
            ],
        });

        // 7. Bind the Active Stripe Session ID to our Hold Node to keep tracking uniform
        dynamicHoldBooking.financials.stripeSessionId = session.id;
        await dynamicHoldBooking.save();

        return res.status(201).json({
            success: true,
            message: 'Temporal reservation lock established. 5-minute counter active.',
            bookingId: dynamicHoldBooking._id,
            stripeCheckoutUrl: session.url //  Frontend hooks into this to redirect instantly to Stripe's payment gateway portal
        });

    } catch (error) {
        res.status(500).json({ error: 'Lock Initialization Engine Defect', details: error.message });
    }
};

// @desc    Fetch all paid reservations waiting for an admin room assignment
// @route   GET /api/bookings/pending-approvals
const getPendingApprovals = async (req, res) => {
    try {
        // Find bookings that have completed their payments but lack a physical room assignment
        const pendingBookings = await Booking.find({ status: 'awaiting_approval' })
            .populate('userId', 'name email department institutionId')
            .sort({ 'timeFrame.startDate': 1 });

        return res.status(200).json({
            success: true,
            count: pendingBookings.length,
            bookings: pendingBookings
        });
    } catch (error) {
        res.status(500).json({ error: 'Allocation Read Defect', details: error.message });
    }
};

// @desc    Formally assign a physical room number to an awaiting booking node
// @route   PATCH /api/bookings/allocate/:id
const allocatePhysicalRoom = async (req, res) => {
    try {
        const { roomId } = req.body;
        const bookingId = req.params.id;

        if (!roomId) {
            return res.status(400).json({ message: 'Missing target physical room asset identifier.' });
        }

        // 1. Fetch target booking profile
        const targetBooking = await Booking.findById(bookingId);
        if (!targetBooking) {
            return res.status(404).json({ message: 'Target reservation record not found.' });
        }

        // 2. Fetch chosen physical room details
        const selectedRoom = await Room.findById(roomId);
        if (!selectedRoom || selectedRoom.status === 'maintenance') {
            return res.status(400).json({ message: 'Selected room asset is either invalid or offline for maintenance.' });
        }

        // 3. Prevent Double-Bookings: Scan for any allocated booking already holding this specific room number
        const doubleBookingConflict = await Booking.findOne({
            assignedRoomId: roomId,
            'timeFrame.startDate': { $lt: targetBooking.timeFrame.endDate },
            'timeFrame.endDate': { $gt: targetBooking.timeFrame.startDate },
            status: 'allocated'
        });

        if (doubleBookingConflict) {
            return res.status(400).json({ 
                message: `Allocation Collision: Room ${selectedRoom.roomNumber} has already been assigned to another guest for these dates.` 
            });
        }

        // 4. Update the reservation status and bind the physical asset
        targetBooking.assignedRoomId = roomId;
        targetBooking.status = 'allocated';
        await targetBooking.save();

        return res.status(200).json({
            success: true,
            message: `Room ${selectedRoom.roomNumber} successfully assigned to reservation.`,
            booking: targetBooking
        });

    } catch (error) {
        res.status(500).json({ error: 'Allocation Write Mutation Defect', details: error.message });
    }
};

module.exports = { getLiveAvailability,
     initializeBookingHold, 
     getPendingApprovals, 
     allocatePhysicalRoom
 };