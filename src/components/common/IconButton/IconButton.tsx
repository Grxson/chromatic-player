import { type ButtonHTMLAttributes, forwardRef } from "react";

export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: IconButtonSize;
  tone?: "default" | "subtle" | "primary";
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const toneClasses: Record<NonNullable<IconButtonProps["tone"]>, string> = {
  default: "text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
  subtle:
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
  primary:
    "text-[var(--color-canvas)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-md transition-colors " +
  "duration-150 focus-visible:outline-none focus-visible:ring-1 " +
  "focus-visible:ring-[var(--color-text-secondary)] disabled:opacity-50 " +
  "disabled:cursor-not-allowed";

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = "md", tone = "default", className, type = "button", ...rest }, ref) => {
    const classes = [baseClasses, sizeClasses[size], toneClasses[tone], className ?? ""]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={classes}
        {...rest}
      />
    );
  },
);

IconButton.displayName = "IconButton";
