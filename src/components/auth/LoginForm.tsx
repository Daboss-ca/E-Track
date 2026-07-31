import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { User, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { LoginFormData } from '../../types/auth';
import { supabase } from '../../lib/supabase'; 

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export default function LoginForm({
  onSubmit,
  isSubmitting = false,
  error: parentError = null,
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false); 
  
  const [resetError, setResetError] = useState<string | null>(null); 
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange =
    (field: keyof LoginFormData) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

      if (resetError) setResetError(null);
      if (successMessage) setSuccessMessage(null);
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isResetMode) {
      handleForgotPassword();
    } else {
      onSubmit?.(formData);
    }
  };

  const handleForgotPassword = async () => {
    setResetError(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(formData.identifier, {
      redirectTo: 'http://localhost:5173/update-password',
    });

    if (error) {
      setResetError(error.message);
    } else {
      setSuccessMessage("Password reset link sent! Please check your email inbox or spam folder.");
      setFormData((prev) => ({ ...prev, identifier: '' }));
    }
  };

  const toggleResetMode = (mode: boolean) => {
    setIsResetMode(mode);
    setResetError(null);
    setSuccessMessage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-wide">
          {isResetMode ? 'Reset Password' : 'Log in'}
        </h1>
      </div>

      {/* Error Banner */}
      {(parentError || resetError) && (
        <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
          <p>{parentError || resetError}</p>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-start gap-3 p-3 rounded-md bg-teal-50 border border-teal-200 text-teal-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
          <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
            <User className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            value={formData.identifier}
            onChange={handleChange('identifier')}
            placeholder={isResetMode ? "Enter your email" : "Username or Email"}
            className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
        </div>

        {!isResetMode && (
          <div className="flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
            <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
              <Lock className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="Password"
              className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 text-gray-400 hover:text-teal-600 transition-colors"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        {!isResetMode ? (
          <>
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => toggleResetMode(true)}
              className="hover:text-teal-600 transition-colors"
            >
              Forget Password?
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => toggleResetMode(false)}
            className="flex items-center gap-1 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Login
          </button>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto md:px-12 mx-auto block bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-medium text-sm py-3 rounded-md shadow-md transition-colors"
        >
          {isResetMode ? 'Send Reset Link' : (isSubmitting ? 'Logging in…' : 'Log in')}
        </button>
      </div>
    </form>
  );
}