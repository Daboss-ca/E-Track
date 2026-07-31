import { supabase } from '../lib/supabase';
import type{ LoginFormData, RegisterFormData } from '../types/auth';

export const signUpUser = async (data: RegisterFormData) => {
  const { data: authData, error } = await supabase.auth.signUp({
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
  return authData;
};

export const verifyEmailOTP = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) throw error;
  return data;
};

export const signInUser = async (data: LoginFormData) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.identifier,
    password: data.password,
  });

  if (error) throw error;
  return authData;
};