import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authStorage } from '../../../models/authModel';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  

  if (!authStorage.isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
