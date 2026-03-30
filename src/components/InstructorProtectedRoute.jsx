import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const InstructorProtectedRoute = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken');

    // Check if user is logged in and has instructor role
    const isInstructor = token && user && (user.role === 'ins' || user.role === 'ad');

    if (!isInstructor) {
        // Redirection logic: 
        // If not logged in at all, go to login.
        // If logged in as student, go to dashboard.
        return <Navigate to={token ? "/dashboard" : "/instructor-login"} replace />;
    }

    return <Outlet />;
};

export default InstructorProtectedRoute;
