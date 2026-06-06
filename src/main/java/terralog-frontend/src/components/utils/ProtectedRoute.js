import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Cek apakah user sudah login (dari localStorage)
    const isLoggedIn = localStorage.getItem('userId') && localStorage.getItem('user_role');

    if (!isLoggedIn) {
        // Jika belum login, redirect ke halaman login dan replace history
        return <Navigate to="/login" replace />;
    }

    // Jika sudah login, tampilkan halaman yang diminta
    return children;
};

export default ProtectedRoute;
