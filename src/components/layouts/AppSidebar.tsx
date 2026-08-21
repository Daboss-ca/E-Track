// src/components/layouts/AppSidebar.tsx
import { useSidebar } from '../../hooks/useSidebar';
import SidebarWidget from './SidebarWidget';
import logoSvg from '../../assets/logo.svg'; 

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
  const isSidebarVisible = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 h-screen transition-colors duration-200 ease-in-out z-50 
        ${isExpanded || isMobileOpen || isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Logo Header */}
      <div className={`py-6 flex items-center ${!isSidebarVisible ? 'lg:justify-center' : 'justify-start'}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-transparent p-0">
          <img 
            src={logoSvg} 
            alt="E-WasteTrack Logo" 
            className="h-full w-full object-contain"
          />
        </div>

        {/* Scaled Up & Sharp Logo Name */}
        {isSidebarVisible && (
          <div className="flex items-center font-['Poppins',sans-serif]">
            <span className="text-2xl tracking-tight text-gray-900 dark:text-white leading-none">
              <span className="text-emerald-600 dark:text-emerald-400">Waste</span>
              <span>Track</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6 space-y-4">
          <div>
            {isSidebarVisible && (
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Menu
              </p>
            )}
            <ul className="space-y-1.5">
              {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold'
                          : 'text-gray-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400'
                      } ${!isSidebarVisible ? 'lg:justify-center' : ''}`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {isSidebarVisible && <span>{item.name}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {isSidebarVisible && <SidebarWidget />}
      </div>
    </aside>
  );
}