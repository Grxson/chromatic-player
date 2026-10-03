import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Centered empty/error/loading placeholder. The same shape is used to
 * keep pages consistent while we only handle a small set of states.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
        {icon}
      </div>
      <h2 className="text-base text-[var(--color-text-primary)]">{title}</h2>
      {description ? (
        <p className="max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
