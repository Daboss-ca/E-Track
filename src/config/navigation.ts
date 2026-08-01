export type Role = 'admin' | 'manager' | 'worker' | 'faculty' | 'segregator' | 'officeStaff' | 'custodian';

export interface NavigationItem {
  label: string;
  path: string;
}

export const navigationConfig: Record<Role, NavigationItem[]> = {
  admin: [
    { label: 'Admin Nav', path: '/admin' },
    { label: 'Admin Overview', path: '/admin/overview' },
  ],
  manager: [
    { label: 'Manager Nav', path: '/manager' },
    { label: 'Manager Overview', path: '/manager/overview' },
  ],
  worker: [
    { label: 'Worker Nav', path: '/worker' },
    { label: 'Worker Overview', path: '/worker/overview' },
  ],
  faculty: [
    { label: 'Faculty Nav', path: '/faculty' },
    { label: 'Faculty Overview', path: '/faculty/overview' },
  ],
  segregator: [
    { label: 'Segregator Nav', path: '/segregator' },
    { label: 'Segregator Overview', path: '/segregator/overview' },
  ],
  officeStaff: [
    { label: 'Office Staff Nav', path: '/office-staff' },
    { label: 'Office Staff Overview', path: '/office-staff/overview' },
  ],
  custodian: [
    { label: 'Custodian Nav', path: '/custodian' },
    { label: 'Custodian Overview', path: '/custodian/overview' },
  ],
};