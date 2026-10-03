import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium " +
  "transition-colors duration-150 select-none disabled:opacity-50 " +
  "disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 " +
  "focus-visible:ring-[var(--color-text-secondary)]";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-canvas)] hover:bg-[var(--color-accent-hover)]",
  secondary:
    "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)]",
  ghost: "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
  danger: "bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-surface)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...rest }, ref) => {
    const classes = [baseClasses, sizeClasses[size], variantClasses[variant], className ?? ""]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} type={type} className={classes} {...rest} />;
  },
);

Button.displayName = "Button";
