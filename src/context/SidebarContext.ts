import { createContext } from 'react';

export type SidebarContextValue = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (hovered: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);