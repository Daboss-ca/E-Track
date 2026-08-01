import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});