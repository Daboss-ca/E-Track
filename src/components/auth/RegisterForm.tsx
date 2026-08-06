import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { User, Mail, IdCard, ChevronDown, Lock, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import type { RegisterFormData as AuthRegisterFormData, UserRole } from '../../types/auth';
import { ROLE_OPTIONS } from '../../types/auth';

interface RegisterFormProps {
  onSubmit?: (data: AuthRegisterFormData) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

// Listahan ng mga departamento para sa Faculty at Custodian
const DEPARTMENT_OPTIONS = [
  { code: 'CICS', name: 'College of Information and Computing Sciences' },
  { code: 'CEIT', name: 'College of Engineering and Information Technology' },
  { code: 'CAS', name: 'College of Arts and Sciences' },
  { code: 'CAFENR', name: 'College of Agriculture, Food, Environment and Natural Resources' },
  { code: 'CON', name: 'College of Nursing' },
];

export default function RegisterForm({
  onSubmit,
  isSubmitting = false,
  error = null,
}: RegisterFormProps) {

  const [formData, setFormData] = useState<AuthRegisterFormData>({
    fullName: '',
    cvsuEmail: '',
    role: 'faculty',
    departmentCode: '',
    password: '',
    confirmPassword: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleTextChange =
    (field: keyof Omit<AuthRegisterFormData, 'role'>) => 
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (localError) setLocalError(null);
    };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setFormData((prev) => ({ 
      ...prev, 
      role: newRole,
      departmentCode: '' // I-reset ang value kapag nagpalit ng role para maiwasan ang maling data
    }));
    if (localError) setLocalError(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!formData.departmentCode) {
      setLocalError('Please select or enter your Department / Office / Assignment.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match. Please try again.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    
    onSubmit?.(formData);
  };

  const displayError = localError || error;

  // Aling roles ang gagamit ng dropdown vs manual input
  const isDropdownRole = formData.role === 'faculty' || formData.role === 'custodian';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
          Register
        </h1>
      </div>

      {displayError && (
        <div className="flex items-center gap-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
          <p>{displayError}</p>
        </div>
      )}

      {/* Full Name */}
      <div className="flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
        <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
          <User className="w-5 h-5" strokeWidth={1.5} />
        </span>
        <input
          name="fullName"
          type="text"
          required
          value={formData.fullName}
          onChange={handleTextChange('fullName')}
          placeholder="Full Name"
          className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>

      {/* Email */}
      <div className="flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
        <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
          <Mail className="w-5 h-5" strokeWidth={1.5} />
        </span>
        <input
          name="cvsuEmail"
          type="email"
          required
          pattern=".+@cvsu\.edu\.ph$"
          value={formData.cvsuEmail}
          onChange={handleTextChange('cvsuEmail')}
          placeholder="CvSU Email"
          className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>

      {/* Role */}
      <div className="relative flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
        <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
          <IdCard className="w-5 h-5" strokeWidth={1.5} />
        </span>
        <select
          name="role"
          required
          value={formData.role}
          onChange={handleRoleChange}
          className="flex-1 min-w-0 appearance-none bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none cursor-pointer"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="flex items-center justify-center w-9 shrink-0 text-gray-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" strokeWidth={2} />
        </span>
      </div>

      {/* Conditional Department / Office Input Field */}
      {isDropdownRole ? (
        /* Faculty & Custodian: Dropdown */
        <div className="relative flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
          <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
            <Building2 className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <select
            name="departmentCode"
            required
            value={formData.departmentCode}
            onChange={(e) => setFormData((prev) => ({ ...prev, departmentCode: e.target.value }))}
            className="flex-1 min-w-0 appearance-none bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none cursor-pointer"
          >
            <option value="" disabled>Select Department Code</option>
            {DEPARTMENT_OPTIONS.map((dept) => (
              <option key={dept.code} value={dept.code}>
                {dept.code} - {dept.name}
              </option>
            ))}
          </select>
          <span className="flex items-center justify-center w-9 shrink-0 text-gray-400 pointer-events-none">
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </span>
        </div>
      ) : (
        /* Office Staff & Segregator: Manual Text Input */
        <div className="flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
          <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
            <Building2 className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <input
            name="departmentCode"
            type="text"
            required
            value={formData.departmentCode}
            onChange={handleTextChange('departmentCode')}
            placeholder={formData.role === 'offc_staff' ? "Office Name (e.g., Supply Office)" : "Assignment Area (e.g., Materials Recovery Facility)"}
            className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
        </div>
      )}

      {/* Password */}
      <div className="flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
        <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
          <Lock className="w-5 h-5" strokeWidth={1.5} />
        </span>
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          value={formData.password}
          onChange={handleTextChange('password')}
          placeholder="Password"
          className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="px-3 text-gray-400 hover:text-teal-600 transition-colors"
        >
          {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="flex items-stretch rounded-md bg-white border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
        <span className="flex items-center justify-center w-12 shrink-0 text-gray-400">
          <Lock className="w-5 h-5" strokeWidth={1.5} />
        </span>
        <input
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          required
          value={formData.confirmPassword}
          onChange={handleTextChange('confirmPassword')}
          placeholder="Confirm Password"
          className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto md:px-12 mx-auto block bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-medium text-sm py-3 rounded-md shadow-md transition-colors"
        >
          {isSubmitting ? 'Creating account…' : 'Register'}
        </button>
      </div>
    </form>
  );
}