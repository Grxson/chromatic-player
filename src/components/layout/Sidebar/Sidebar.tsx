import { Home, Library, ListMusic, PanelLeftClose, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useSettingsStore } from "@/stores";
import { IconButton } from "@/components/common/IconButton";
import { Tooltip } from "@/components/common/Tooltip";
import { cn } from "@/utils/cn";

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

  const widthClass = collapsed ? "w-[68px]" : "w-[232px]";

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-canvas)] transition-[width] duration-200 ease-out",
        widthClass,
      )}
    >
      <div className="flex h-14 items-center px-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <BrandMark />
          {!collapsed ? (
            <span className="select-none text-sm font-semibold tracking-[0.18em] text-[var(--color-text-primary)]">
              CHROMATIC
            </span>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            active={currentView === item.key}
            collapsed={collapsed}
            onSelect={() => onNavigate(item.key)}
          />
        ))}
      </nav>

      <div className="flex h-12 items-center justify-between border-t border-[var(--color-border)] px-3 text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {collapsed ? (
          <Tooltip label="v0.0.4 — Visual QA & Interaction Hardening">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] text-[10px]">
              v
            </span>
          </Tooltip>
        ) : (
          <span className="truncate">v0.0.4</span>
        )}
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
              className={cn("transition-transform duration-200", collapsed ? "rotate-180" : "")}
            />
          </IconButton>
        </Tooltip>
      </div>
    </aside>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onSelect: () => void;
}) {
  const button = (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "group flex h-9 items-center gap-3 rounded-md px-2 text-sm transition-colors duration-150",
        collapsed ? "justify-center" : "",
        active
          ? "bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
      )}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span>
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </button>
  );

  return collapsed ? <Tooltip label={item.label}>{button}</Tooltip> : button;
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-album-accent)]/15 text-[var(--color-album-accent)]"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4">
        <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.18" />
        <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.45" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </svg>
    </span>
  );
}
