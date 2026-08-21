import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types/auth';
import { AuthContext } from './AuthContextType';
import type { AuthStatus } from './AuthContextType';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  
  const [status, setStatus] = useState<AuthStatus>('INITIALIZING');

  const fetchRole = useCallback(async (userId: string) => {
    setStatus('FETCHING_PROFILE');
    
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (data?.role) {
      setRole(data.role as UserRole);
      setStatus('AUTHENTICATED');
    } else {
      setRole(null);
      setStatus('UNASSIGNED');
    }
  }, []);

  // Function para sa Sign Out gamit ang Supabase
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setStatus('UNAUTHENTICATED');
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setStatus('UNAUTHENTICATED');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRole(session.user.id);
      } else {
        setRole(null);
        setStatus('UNAUTHENTICATED');
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  return (
    // Isinama na ang signOut sa Context Value
    <AuthContext.Provider value={{ user, role, status, signOut }}>
      {status !== 'INITIALIZING' && children}
    </AuthContext.Provider>
  );
}