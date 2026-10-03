import type { ReactNode } from "react";
import { Sidebar, type ViewKey } from "@/components/layout/Sidebar";
import { MiniPlayer } from "@/components/player/MiniPlayer";

export interface AppShellProps {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  onExpandPlayer: () => void;
  onOpenQueue: () => void;
  children: ReactNode;
}

/**
 * Top-level layout composing the sidebar, the routed content area and
 * the mini player. It owns no business logic — only composition.
 */
export function AppShell({
  currentView,
  onNavigate,
  onExpandPlayer,
  onOpenQueue,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--color-canvas)] text-[var(--color-text-primary)]">
      <Sidebar currentView={currentView} onNavigate={onNavigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <div className="h-[88px] shrink-0">
          <MiniPlayer onExpand={onExpandPlayer} onOpenQueue={onOpenQueue} />
        </div>
      </div>
    </div>
  );
}
