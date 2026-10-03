import type { ReactNode } from "react";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

/**
 * Contextual page header. Stays visually quiet so the content can take
 * the spotlight; hierarchy comes from typography, weight and opacity.
 */
export function Header({ title, subtitle, eyebrow, actions }: HeaderProps) {
  return (
    <header className="flex items-end justify-between gap-6 px-8 pb-6 pt-8">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="truncate text-[28px] font-semibold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        ) : null}
      </div>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
