import axios from 'axios';

// Create a single, shared Axios instance pointing directly to your Node.js server
const API = axios.create({
    baseURL: 'http://localhost:3000/api', 
});

// 💥 THE PRODUCTION BRIDGE MOVE: Automatic Token Injection Interceptor
// Every single time your frontend calls the backend, this code intercepts it
// and automatically injects the active user token into the request headers.
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('vnit_guest_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;