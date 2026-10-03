import { Search } from "lucide-react";
import type { ReactNode } from "react";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-canvas)] px-6 py-4">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
        {subtitle ? (
          <p className="truncate text-xs text-[var(--color-text-secondary)]">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <div
          aria-hidden="true"
          className="hidden items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-muted)] md:flex"
        >
          <Search size={12} aria-hidden="true" />
          <span>Quick search</span>
          <span className="rounded bg-[var(--color-elevated)] px-1.5 py-0.5 text-[10px]">soon</span>
        </div>
        {actions}
      </div>
    </header>
  );
}
