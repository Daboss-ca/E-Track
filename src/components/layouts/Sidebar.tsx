// src/components/layouts/Sidebar.tsx
import React, { useState } from 'react';
import { Leaf, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { navigationConfig, type NavigationItem } from '../../config/navigation';

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  onOpenSettings: () => void;
  isExpanded?: boolean; // Para sa collapse/expand toggle galing sa header
}

const Sidebar: React.FC<SidebarProps> = ({ activeId, onNavigate, onOpenSettings, isExpanded = true }) => {
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
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-800 bg-[#0c1427] text-gray-300 transition-all duration-300 ${
        isExpanded ? 'w-[280px]' : 'w-[90px]'
      }`}
    >
      {/* Brand Logo Header */}
      <div className={`flex h-20 items-center gap-3 px-6 ${!isExpanded ? 'justify-center px-0' : ''}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
          <Leaf className="h-5 w-5" strokeWidth={2.25} />
        </div>
        {isExpanded && (
          <div>
            <p className="text-[17px] font-bold tracking-tight text-white">E-Track</p>
            <p className="text-[11px] font-medium text-gray-400">E-Waste System</p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar">
        <div>
          {isExpanded && <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Menu</p>}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const active = activeId === item.id;

              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => (hasChildren ? toggleExpand(item.id) : onNavigate(item.id))}
                    title={!isExpanded ? item.label : undefined}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-[13.5px] font-medium transition-all ${
                      active
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    } ${!isExpanded ? 'justify-center px-0' : ''}`}
                  >
                    <span className="flex items-center gap-3">
                      {Icon && <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} strokeWidth={2} />}
                      {isExpanded && <span>{item.label}</span>}
                    </span>
                    {hasChildren && isExpanded && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded[item.id] ? 'rotate-180 text-white' : 'text-gray-500'}`} />
                    )}
                  </button>

                  {/* Sub-menu */}
                  {hasChildren && isExpanded && expanded[item.id] && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-800 pl-4">
                      {item.children!.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => onNavigate(child.id)}
                          className={`block w-full rounded-lg px-3 py-2 text-left text-[12.5px] transition-colors ${
                            activeId === child.id ? 'font-semibold text-emerald-400 bg-emerald-950/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
        </div>
      </div>

      {/* Bottom Profile / Logout Area */}
      <div className="border-t border-gray-800 p-4 space-y-2">
        <button
          type="button"
          onClick={onOpenSettings}
          title={!isExpanded ? 'Settings' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors ${!isExpanded ? 'justify-center px-0' : ''}`}
        >
          <Settings className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={2} />
          {isExpanded && <span>Settings</span>}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          title={!isExpanded ? 'Logout' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-red-400 hover:bg-red-500/10 transition-colors ${!isExpanded ? 'justify-center px-0' : ''}`}
        >
          <LogOut className="h-5 w-5 shrink-0 text-red-400" strokeWidth={2} />
          {isExpanded && <span>Logout</span>}
        </button>

        {isExpanded && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#131d35] p-2.5 border border-gray-800/80">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold text-white">{displayName}</p>
              <p className="truncate text-[10px] uppercase font-bold text-emerald-400">{displayRole}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;