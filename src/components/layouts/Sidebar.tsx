// src/components/layouts/Sidebar.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { navigationConfig, type NavigationItem } from '../../config/navigation';

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeId, onNavigate, onOpenSettings }) => {
  const { user, role } = useAuth();
  
  const navItems: NavigationItem[] = role && navigationConfig[role] 
    ? navigationConfig[role] 
    : navigationConfig.faculty;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const displayRole = role || 'Unassigned';

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-[#F4F5F7] px-3 py-4">
      {/* Brand Logo */}
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <Leaf className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[15px] font-semibold leading-tight text-gray-900">E-Track</p>
          <p className="text-[11px] leading-tight text-gray-400">E-Waste Inventory</p>
        </div>
      </div>

      {/* Dynamic Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const active = activeId === item.id;

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => (hasChildren ? toggleExpand(item.id) : onNavigate(item.id))}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100'
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
                  {item.label}
                </span>
                {hasChildren &&
                  (expanded[item.id] ? (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  ))}
              </button>

              {/* Sub-menu rendering */}
              {hasChildren && (expanded[item.id] ?? true) && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
                  {item.children!.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => onNavigate(child.id)}
                      className={`block w-full rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors ${
                        activeId === child.id
                          ? 'bg-white font-medium text-gray-900 shadow-sm'
                          : 'text-gray-400 hover:bg-white/60 hover:text-gray-600'
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile & Actions */}
      <div className="mt-4 space-y-1 border-t border-gray-200 pt-3">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-500 transition-colors hover:bg-white/60 hover:text-gray-700"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Settings
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Logout
        </button>

        <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-gray-100">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium text-gray-800">{displayName}</p>
            <p className="truncate text-[11px] font-semibold uppercase text-emerald-600 tracking-wider">
              {displayRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;