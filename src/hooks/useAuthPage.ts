import { useState } from 'react';
import { supabase } from '../lib/supabase';

export type AuthView = 'login' | 'register';

export interface SupabaseAuthError {
  code?: string;
  message?: string;
}

export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface RegisterFormData {
  cvsuEmail: string;
  password: string;
  fullName: string;
  role: string;
}

// Helper Functions
const getErrorMessage = (error: SupabaseAuthError | null) => {
  if (!error) return null;

  switch (error.code) {
    case 'user_already_exists':
      return 'This email is already registered. Please use a different email or log in.';
    case 'weak_password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'invalid_email':
      return 'The email format is invalid.';
    case 'invalid_credentials':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'email_not_confirmed':
      return 'Your email has not been verified. Please check your inbox.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

const validateRegisterInput = (data: RegisterFormData) => {
  if (!data.cvsuEmail || !data.password || !data.fullName) {
    throw new Error('All fields are required.');
  }
  if (!data.cvsuEmail.endsWith('@cvsu.edu.ph')) {
    throw new Error('Please use your official CvSU email address.');
  }
  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
};

// Custom Hook
export function useAuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleView = () => {
    setView((prev) => (prev === 'login' ? 'register' : 'login'));
    setError(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.identifier,
      password: data.password,
    });

    if (error) {
      setError(getErrorMessage(error as SupabaseAuthError));
    } else {
      window.location.href = '/dashboard';
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      validateRegisterInput(data);

      const { error } = await supabase.auth.signUp({
        email: data.cvsuEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      });

      if (error) throw error;

      setSuccessMessage('Registration successful! Please check your email for verification.');
    } catch (err: unknown) {
      const error = err as SupabaseAuthError;

      if (error.code) {
        setError(getErrorMessage(error));
      } else {
        setError(error.message || 'An unexpected error occurred.');
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

//TODO: Implement Role-Based Redirection