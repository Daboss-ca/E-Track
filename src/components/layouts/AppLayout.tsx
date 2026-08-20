// src/components/layouts/AppLayout.tsx
import React from 'react';
import { SidebarProvider } from '../../context/SidebarProvider';
import { useSidebar } from '../../hooks/useSidebar';
import AppHeader from './AppHeader';
import Backdrop from './Backdrop';
import AppSidebar, { NavItemConfig } from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  activeId: string;
  onNavigate: (id: string) => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  navItems: NavItemConfig[];
}

const LayoutContent: React.FC<AppLayoutProps> = ({
  children,
  activeId,
  onNavigate,
  searchValue,
  onSearchChange,
  navItems,
}) => {
  const { isExpanded, isHovered } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white/90 flex transition-colors duration-200 overflow-x-hidden">
      <div>
        <AppSidebar activeId={activeId} onNavigate={onNavigate} items={navItems} />
        <Backdrop />
      </div>
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        }`}
      >
        <AppHeader searchValue={searchValue} onSearchChange={onSearchChange} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function AppLayout(props: AppLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent {...props} />
    </SidebarProvider>
  );
}