const Stripe = require('stripe');

// Initialize the Stripe instance using your high-security backend secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;