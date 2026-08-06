import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { RegisterFormData, UserRole } from '../types/auth';

export type AuthView = 'login' | 'register';

export interface SupabaseAuthError {
  code?: string;
  message?: string;
}

export interface LoginFormData {
  identifier: string;
  password: string;
}

const getErrorMessage = (error: SupabaseAuthError | null) => {
  if (!error) return null;
  switch (error.code) {
    case 'user_already_exists': return 'This email is already registered.';
    case 'weak_password': return 'The password is too weak.';
    case 'invalid_credentials': return 'Invalid email or password.';
    default: return error.message || 'An unexpected error occurred.';
  }
};

const validateRegisterInput = (data: RegisterFormData) => {
  if (!data.cvsuEmail || !data.password || !data.fullName || !data.departmentCode) {
    throw new Error('All fields including department are required.');
  }
  if (!data.cvsuEmail || !data.password || !data.fullName) throw new Error('All fields are required.');
  if (!data.cvsuEmail.endsWith('@cvsu.edu.ph')) throw new Error('Please use your official CvSU email.');
  if (data.password.length < 6) throw new Error('Password must be at least 6 characters.');
};

const getRouteByRole = (role: string): string => {
  const normalizedRole = role === 'office_staff' ? 'offc_staff' : role;
  const routes: Record<string, string> = {
    admin: '/admin',
    faculty: '/faculty',
    offc_staff: '/faculty',
    custodian: '/custodian',
    segregator: '/segregator',
  };
  return routes[normalizedRole] || '/';
};

export function useAuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleView = () => {
    setView((prev) => (prev === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.identifier,
      password: data.password,
    });

    if (authError) {
      setError(getErrorMessage(authError as SupabaseAuthError));
    } else if (authData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profile) {
        const role = profile.role as UserRole;
        navigate(getRouteByRole(role));
      }
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      validateRegisterInput(data);
      const { error } = await supabase.auth.signUp({
        email: data.cvsuEmail,
        password: data.password,
        options: { data: { full_name: data.fullName, role: data.role, department_code: data.departmentCode} },
      });
      if (error) throw error;
      setSuccessMessage('Registration successful!');
    } catch (err: unknown) {

      if (err instanceof Error) {
        setError(err.message);
      } else {
        const error = err as SupabaseAuthError;
        setError(getErrorMessage(error) || 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    view,
    toggleView,
    isSubmitting,
    error,
    successMessage,
    handleLogin,
    handleRegister,
  };
}