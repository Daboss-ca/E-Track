import React from 'react';
import logoSvg from '../../assets/logo.svg';

interface BrandLogoProps {
  collapsed?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ collapsed = false }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Container Box: Inalis ang mabigat na background overlay para malinis */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 p-2 dark:bg-emerald-500/20">
        <img 
          src={logoSvg} 
          alt="E-Track Logo" 
          className="h-full w-full object-contain"
        />
      </div>

      {/* Brand Typography: Binawasan ang kapal para bumagay sa Navigation menu */}
      {!collapsed && (
        <div className="flex flex-col justify-center leading-tight">
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            <span className="text-emerald-600 dark:text-emerald-400">E-</span>
            <span>Track</span>
          </span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Waste Management
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;