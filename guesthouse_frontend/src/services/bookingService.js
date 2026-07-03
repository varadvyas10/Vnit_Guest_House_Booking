import API from './api';

export const bookingService = {
    // 🔒 Initialize a booking request following your flat object expectations
    createBookingLock: async (bookingPayload) => {
        const response = await API.post('/bookings/initialize-hold', bookingPayload);
        return response.data;
    },

    // 📋 Fetch historical stay lists matching your new route configuration precisely
    getStudentBookings: async () => {
        const response = await API.get('/bookings/my-reservations');
        return response.data;
    },

    // ⭐ Submit a 1-5 star review rating map payload for an allocated checkout stay
    submitReview: async (bookingId, reviewPayload) => {
        const response = await API.post(`/bookings/${bookingId}/review`, reviewPayload);
        return response.data;
    }
};