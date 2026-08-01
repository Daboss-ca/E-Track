import { Navigate } from 'react-router-dom';
import React from 'react'; 
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, role, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && !allowedRoles.includes(role)) return <div>Unauthorized</div>;
  
  return <>{children}</>;
}