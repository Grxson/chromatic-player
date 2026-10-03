export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * Minimal accessible toggle built on a checkbox. Visually presented as a
 * sliding switch. Uses CSS transitions rather than a JS animation.
 */
export function Toggle({ checked, onChange, disabled, ariaLabel }: ToggleProps) {
  return (
    <label
      className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors duration-150 ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-2)]"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[var(--color-canvas)] transition-transform duration-150 ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </label>
  );
}
