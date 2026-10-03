import { type ChangeEvent, useCallback } from "react";

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel: string;
  onChange: (value: number) => void;
}

/**
 * Minimal horizontal slider. Implemented as a native range input for
 * accessibility and consistent behaviour across platforms. Visual styling
 * is restrained — Chromatic Dark avoids heavy effects.
 */
export function Slider({ value, min = 0, max = 1, step = 0.01, ariaLabel, onChange }: SliderProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(Number(event.target.value));
    },
    [onChange],
  );

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={handleChange}
      className="chromatic-slider h-1 w-full appearance-none rounded-full bg-[var(--color-surface-2)] accent-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-text-secondary)]"
    />
  );
}
