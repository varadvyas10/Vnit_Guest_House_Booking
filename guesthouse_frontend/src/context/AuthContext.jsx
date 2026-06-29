import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Synchronize user session status immediately on window mount/refresh
    useEffect(() => {
        const checkLoggedInUser = () => {
            const savedUser = localStorage.getItem('vnit_guest_user');
            const savedToken = localStorage.getItem('vnit_guest_token');

            if (savedUser && savedToken) {
                setUser(JSON.parse(savedUser));
            }
            setLoading(false);
        };
        checkLoggedInUser();
    }, []);

    // Session Login Pipeline Execution
    const login = async (email, password) => {
        try {
            const response = await API.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;

            // Commit credentials to physical browser storage cache bounds
            localStorage.setItem('vnit_guest_token', token);
            localStorage.setItem('vnit_guest_user', JSON.stringify(userData));

            setUser(userData);
            return { success: true, role: userData.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Authentication sequence aborted by server.'
            };
        }
    };

    // Clear Session Pipeline Execution
    const logout = () => {
        localStorage.removeItem('vnit_guest_token');
        localStorage.removeItem('vnit_guest_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom layout hook utility to quickly consume auth metrics inside UI components
export const useAuth = () => useContext(AuthContext);