import type { ReactNode } from 'react';
import type { Role } from '../../config/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
  title?: string;
  subtitle?: string;
  userName?: string;
}

export default function DashboardLayout({
  children,
  role,
  title = 'Dashboard',
  subtitle = 'Overview and insights',
  userName = 'User',
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar role={role} userName={userName} />

        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar role={role} title={title} subtitle={subtitle} userName={userName} />

          <main className="flex-1 p-6 md:p-8">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
