import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/20",
  secondary:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-base px-5 py-2.5 gap-2",
};

/**
 * Generic action button. Composition over configuration: pass an `icon`
 * rather than baking icon variants into the component.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {Icon && iconPosition === "left" && <Icon className="h-4 w-4" />}
        {children}
        {Icon && iconPosition === "right" && <Icon className="h-4 w-4" />}
      </button>
    );
  }
);

Button.displayName = "Button";