export type UserRole = 'faculty' | 'offc_staff' | 'segregator' | 'custodian';

export interface ROLE_OPTION {
  value: UserRole;
  label: string;
}

export const ROLE_OPTIONS: ROLE_OPTION[] = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'offc_staff', label: 'Office Staff' },
  { value: 'segregator', label: 'Segregator' },
  { value: 'custodian', label: 'Custodian' },
];



export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  cvsuEmail: string;
  role: UserRole;
  departmentCode: string;
  password: string;
  confirmPassword: string;
}