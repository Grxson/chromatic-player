import { Home, Library, ListMusic, PanelLeftClose, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useSettingsStore } from "@/stores";
import { IconButton } from "@/components/common/IconButton";
import { Tooltip } from "@/components/common/Tooltip";

export type ViewKey = "home" | "search" | "library" | "settings";

export interface SidebarProps {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
}

interface NavItem {
  key: ViewKey;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { key: "home", label: "Home", icon: <Home size={18} aria-hidden="true" /> },
  {
    key: "search",
    label: "Search",
    icon: <ListMusic size={18} aria-hidden="true" />,
  },
  {
    key: "library",
    label: "Library",
    icon: <Library size={18} aria-hidden="true" />,
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings size={18} aria-hidden="true" />,
  },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const collapsed = useSettingsStore((state) => state.sidebarCollapsed);
  const setCollapsed = useSettingsStore((state) => state.setSidebarCollapsed);

  const widthClass = collapsed ? "w-16" : "w-60";

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-canvas)] transition-[width] duration-200 ${widthClass}`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed ? (
          <span className="truncate text-sm font-semibold tracking-wide text-[var(--color-text-primary)]">
            Chromatic
          </span>
        ) : null}
        <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <IconButton
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            tone="subtle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <PanelLeftClose
              size={16}
              aria-hidden="true"
              className={collapsed ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </IconButton>
        </Tooltip>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = currentView === item.key;
          const baseClasses =
            "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors duration-150";
          const stateClasses = active
            ? "bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]";
          const labelClasses = collapsed ? "sr-only" : "truncate";

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`${baseClasses} ${stateClasses}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="inline-flex w-5 items-center justify-center">{item.icon}</span>
              <span className={labelClasses}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 text-xs text-[var(--color-text-muted)]">
        {!collapsed ? "v0.0.2 — Foundation Hardening" : "v0.0.2"}
      </div>
    </aside>
  );
}
