import { Navigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppState } from '../context/AppStateContext';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

function normalizeRole(role: string | null | undefined) {
  if (!role) return undefined;
  if (role === 'offc_staff') return 'officeStaff';
  return role;
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, role, loading } = useAuth();
  const { activeRole } = useAppState();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  const effectiveRole = normalizeRole(activeRole) || normalizeRole(role);
  const actualRole = normalizeRole(role);
  const isAllowed = effectiveRole ? allowedRoles.includes(effectiveRole) : false;
  const isActualAllowed = actualRole ? allowedRoles.includes(actualRole) : false;

  if (!isAllowed && !isActualAllowed) return <div>Unauthorized</div>;

  return <>{children}</>;
}

