import { useState } from 'react';
import type { FormEvent } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setSuccessMessage("Password successfully updated! Redirecting you to login...");
      
      setTimeout(() => {
        window.location.href = '/'; 
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <form onSubmit={handleUpdatePassword} className="space-y-6" noValidate>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide">Set New Password</h1>
            <p className="text-sm text-gray-500 mt-2">Please enter your new password below.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
              <p>{error}</p>
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
                <Lock className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                disabled={!!successMessage}
                placeholder="Enter new password"
                className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!!successMessage}
                className="px-3 text-gray-400 hover:text-teal-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !!successMessage}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-medium text-sm py-3 rounded-md shadow-md transition-colors"
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}