import React from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium transition-colors";

  // Size styles
  const sizeStyles = {
    sm: "text-theme-xs",
    md: "text-sm",
  };

  // Standard Tailwind Color Variants (gumagana sa Light at Dark mode nang walang extra config)
  const variants = {
    light: {
      primary:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
      success:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
      error:
        "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
      warning:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
      info:
        "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
      light:
        "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark:
        "bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-white",
    },
    solid: {
      primary: "bg-emerald-600 text-white",
      success: "bg-emerald-600 text-white",
      error: "bg-red-600 text-white",
      warning: "bg-amber-500 text-white",
      info: "bg-blue-600 text-white",
      light: "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white/80",
      dark: "bg-gray-800 text-white",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1 inline-flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1 inline-flex items-center">{endIcon}</span>}
    </span>
  );
};

export default Badge;