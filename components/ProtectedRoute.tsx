import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Simple role-based access control (RBAC) simulation
  if (requiredRole && user?.role !== requiredRole && user?.role !== Role.SUPER_ADMIN) {
    // If they don't have permission, maybe redirect to a "Forbidden" page or dashboard
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};