import { type ChangeEvent, useCallback, useEffect, useRef } from "react";

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel: string;
  onChange: (value: number) => void;
}

/**
 * Minimal horizontal slider. Uses the native range input so we keep
 * accessibility, keyboard support and platform behaviour for free.
 * The track and thumb are restyled to fit the Chromatic Dark palette
 * and a progress fill is applied via a CSS variable.
 */
export function Slider({ value, min = 0, max = 1, step = 0.01, ariaLabel, onChange }: SliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(Number(event.target.value));
    },
    [onChange],
  );

  // Keep the colored fill in sync with the value without re-rendering.
  useEffect(() => {
    const element = inputRef.current;
    if (!element) {
      return;
    }
    const ratio = max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
    element.style.setProperty("--slider-progress", `${(ratio * 100).toFixed(2)}%`);
  }, [value, min, max]);

  return (
    <input
      ref={inputRef}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={handleChange}
      className="chromatic-slider h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-surface-2)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-text-secondary)] hover:bg-[var(--color-elevated)]"
    />
  );
}
