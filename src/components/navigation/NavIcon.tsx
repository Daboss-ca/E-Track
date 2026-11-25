import React from 'react';
import { LayoutDashboard, FileText, FileCheck2 } from 'lucide-react';

export type NavIconVariant = 'dashboard' | 'return-slip' | 'status-records';

interface NavIconProps {
  variant: NavIconVariant;
  className?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({
  variant,
  className = 'h-5 w-5',
}) => {
  switch (variant) {
    case 'dashboard':
      return <LayoutDashboard className={className} strokeWidth={1.9} />;
    case 'return-slip':
      return <FileText className={className} strokeWidth={1.9} />;
    case 'status-records':
      return <FileCheck2 className={className} strokeWidth={1.9} />;
    default:
      return <FileCheck2 className={className} strokeWidth={1.9} />;
  }
};

export default NavIcon;