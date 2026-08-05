import { Navigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

function normalizeRole(role: string | null | undefined) {
  if (!role) return undefined;
  if (role === 'offc_staff' || role === 'office_staff') {
    return 'faculty';
  }
  return role;
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, role, status } = useAuth();

  const isLoading = status === 'INITIALIZING' || status === 'FETCHING_PROFILE';

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  const effectiveRole = normalizeRole(role);
  const isAllowed = effectiveRole ? allowedRoles.includes(effectiveRole) : false;

  if (!isAllowed) return <div>Unauthorized</div>;

  return <>{children}</>;
}