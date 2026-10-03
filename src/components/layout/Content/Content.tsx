import type { ReactNode } from "react";

export interface ContentProps {
  children: ReactNode;
}

/**
 * Scrollable content area below the header and above the mini player.
 * Kept intentionally minimal — visual rhythm comes from each view.
 */
export function Content({ children }: ContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-[var(--color-canvas)] px-6 py-6">{children}</main>
  );
}
