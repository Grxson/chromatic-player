import type { ReactNode } from "react";

export interface ContentProps {
  children: ReactNode;
}

/**
 * Scrollable content area below the header and above the mini player.
 * Visual rhythm comes from each view; the content surface itself
 * stays neutral.
 */
export function Content({ children }: ContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-[var(--color-canvas)] px-8 pb-10">{children}</main>
  );
}
