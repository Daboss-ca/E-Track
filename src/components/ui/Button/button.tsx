// src/components/ui/Button.tsx
import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-3.5 py-2 text-xs font-medium rounded-lg",
    md: "px-4 py-2.5 text-sm font-medium rounded-xl",
  };

  // Variant Classes (Standard Tailwind for seamless Light & Dark Mode)
  const variantClasses = {
    primary:
      "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500",
    outline:
      "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50 shadow-none hover:bg-emerald-600 dark:hover:bg-emerald-600" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className="inline-flex shrink-0 items-center">{startIcon}</span>}
      <span>{children}</span>
      {endIcon && <span className="inline-flex shrink-0 items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;