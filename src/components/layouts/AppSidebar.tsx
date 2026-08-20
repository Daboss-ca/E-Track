// src/components/layouts/AppSidebar.tsx
import { useSidebar } from '../../hooks/useSidebar';
import SidebarWidget from './SidebarWidget';
import { Leaf } from 'lucide-react';

export interface NavItemConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface AppSidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  items: NavItemConfig[];
}

export default function AppSidebar({ activeId, onNavigate, items }: AppSidebarProps) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 h-screen transition-colors duration-200 ease-in-out z-50 
        ${isExpanded || isMobileOpen || isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex items-center gap-3 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
          <Leaf className="h-5 w-5" />
        </div>
        {(isExpanded || isHovered || isMobileOpen) && (
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white">E-Track</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Waste Management</p>
          </div>
        )}
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6 space-y-4">
          <div>
            {(isExpanded || isHovered || isMobileOpen) && (
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Navigation
              </p>
            )}
            <ul className="space-y-2">
              {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                      } ${!isExpanded && !isHovered ? 'lg:justify-center' : ''}`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && <span>{item.name}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
}