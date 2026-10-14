import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  
  return children;
}