import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({
  title,
  subtitle,
  action,
  footer,
  children,
  className = '',
}: CardProps) {
  return (
    <div className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all h-full w-full ${className}`}>
      {/* Header Section (Lilitaw lang kung may title o action) */}
      {(title || action) && (
        <div className="w-full flex items-center justify-between gap-2 mb-3">
          <div className="min-w-0">
            {title && <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{title}</h4>}
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Body / Main Content Section */}
      <div className="w-full my-auto flex flex-col items-center justify-center">
        {children}
      </div>

      {/* Footer Section (Lilitaw lang kung may footer prop) */}
      {footer && (
        <div className="w-full pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/60 text-xs text-gray-500 dark:text-gray-400">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;