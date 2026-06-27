const stripe = require('../config/stripe');
const Booking = require('../models/Booking');

// @desc    Listen for real-time Stripe asynchronous payment events
// @route   POST /api/webhooks/stripe
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Construct the validated cryptographic event using the raw buffer body
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(` Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the successful transaction session event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            // Pull our database ID out of the Stripe tracking metadata context
            const bookingId = session.client_reference_id;

            const confirmedBooking = await Booking.findById(bookingId);
            if (confirmedBooking) {
                // Update transaction statuses
                confirmedBooking.financials.paymentStatus = 'paid';
                confirmedBooking.status = 'awaiting_approval'; // Hands off to Admin for room allocation
                
                // REMOVE THE HOLD: Clear expiresAt so the TTL index doesn't delete this booking!
                confirmedBooking.expiresAt = undefined; 
                
                await confirmedBooking.save();
                console.log(` Booking Hold Secured Successfully: Booking ID ${bookingId}`);
            }
        } catch (error) {
            console.error(` Error updating booking data via webhook: ${error.message}`);
            return res.status(500).json({ message: 'Internal state transition defect' });
        }
    }

    // Return a clean status 200 to acknowledge receipt of event to Stripe's cloud engine
    res.status(200).json({ received: true });
};

module.exports = { handleStripeWebhook };