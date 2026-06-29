import API from './api';

export const bookingService = {
    // 🔒 Initialize a booking request following your exact schema groups
    createBookingLock: async (bookingPayload) => {
        // Points exactly to your active backend registration route endpoint
        const response = await API.post('/bookings/initialize-hold', bookingPayload);
        return response.data;
    },

    // 📋 Fetch historical stay lists matching your controller's path
    getStudentBookings: async () => {
        const response = await API.get('/bookings/my-bookings');
        return response.data;
    }
};