import { Loader2 } from "lucide-react";

export interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 16, className = "", label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center text-[var(--color-text-secondary)] ${className}`}
    >
      <Loader2 size={size} className="animate-spin" aria-hidden="true" />
    </span>
  );
}
