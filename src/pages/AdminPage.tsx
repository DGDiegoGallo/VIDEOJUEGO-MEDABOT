import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  const isAdmin = user?.rol === 'admin' || user?.role?.name === 'admin';

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/lobby" replace />;
  }

  return <AdminDashboard />;
};