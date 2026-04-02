import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Could use Ant Design Spin here
  }

  // Handle case where user needs to be logged in
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If a specific set of roles is required, check it
  if (allowedRoles) {
    const isAdmin = user.role === 'admin';
    const hasRole = allowedRoles.includes(user.role);

    if (!isAdmin && !hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
