import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roleAccess';

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role === ROLES.CUSTOMER) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/admin" replace />;
};

export default DashboardRedirect;
