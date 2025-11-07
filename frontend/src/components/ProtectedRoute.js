import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated) {
    // Redirecionar para login se não estiver autenticado
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirecionar para home se não for admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

