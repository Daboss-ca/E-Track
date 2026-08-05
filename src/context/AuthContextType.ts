import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types/auth';

export type AuthStatus = 
  | 'INITIALIZING' 
  | 'UNAUTHENTICATED' 
  | 'FETCHING_PROFILE' 
  | 'AUTHENTICATED' 
  | 'UNASSIGNED';

export interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  status: AuthStatus;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);