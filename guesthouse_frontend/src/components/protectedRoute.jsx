import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // 1. Hold rendering while the context evaluates browser localStorage tokens
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-vnit-blue border-t-vnit-accent rounded-full animate-spin"></div>
            </div>
        );
    }

    // 2. Unauthenticated user block: redirect straight back to login terminal
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Unauthorized role block: redirect based on permissions profile
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin' || user.role === 'superadmin') {
            return <Navigate to="/admin-dashboard" replace />;
        }
        return <Navigate to="/student-dashboard" replace />;
    }

    // 4. Authorization cleared: render targeted nested page children components
    return children;
};

export default ProtectedRoute;