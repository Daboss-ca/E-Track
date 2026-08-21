import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types/auth';

export type AuthStatus = 'INITIALIZING' | 'FETCHING_PROFILE' | 'AUTHENTICATED' | 'UNASSIGNED' | 'UNAUTHENTICATED';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  status: AuthStatus;
  signOut: () => Promise<void>; // Idinagdag ang signOut method
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);