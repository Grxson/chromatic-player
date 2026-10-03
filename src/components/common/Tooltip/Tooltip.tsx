import { type ReactNode, useId } from "react";

export interface TooltipProps {
  label: string;
  children: ReactNode;
}

/**
 * Plain HTML/CSS tooltip using `title` semantics and a visually hidden
 * description for screen readers. We keep this dependency-free; richer
 * tooltips can be introduced later if needed.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();
  return (
    <span className="group relative inline-flex">
      <span aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-elevated)] px-2 py-1 text-xs text-[var(--color-text-primary)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
