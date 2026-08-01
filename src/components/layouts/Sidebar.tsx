import { LayoutDashboard, LogOut, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../../config/navigation';
import { navigationConfig } from '../../config/navigation';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  role: Role;
  userName?: string;
}

const sidebarIconMap = {
  dashboard: LayoutDashboard,
};

export default function Sidebar({ role, userName = 'User' }: SidebarProps) {
  const navigate = useNavigate();
  const navItems = navigationConfig[role] ?? navigationConfig.admin;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      navigate('/', { replace: true });
      return;
    }

    console.error('Logout failed:', error.message);
  };

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-sm">
      <div className="mb-8 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{userName}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item, index) => {
          const Icon = index === 0 ? sidebarIconMap.dashboard : LayoutDashboard;

          return (
            <button
              key={`${item.path}-${item.label}`}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => {
          void handleLogout();
        }}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
