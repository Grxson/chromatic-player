import { useMemo } from "react";
import { Slider } from "@/components/common/Slider";
import { formatDuration } from "@/utils/time";

export interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
}

/**
 * Transport progress bar. Wraps the base Slider with proper time labels
 * and clamps the value range so the track can never seek past duration.
 */
export function ProgressBar({ position, duration, onSeek }: ProgressBarProps) {
  const max = useMemo(() => Math.max(duration, 0.001), [duration]);

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-right text-[11px] tabular-nums text-[var(--color-text-muted)]">
        {formatDuration(position)}
      </span>
      <div className="flex-1">
        <Slider
          ariaLabel="Seek"
          value={Math.min(position, max)}
          min={0}
          max={max}
          step={0.5}
          onChange={onSeek}
        />
      </div>
      <span className="w-10 text-[11px] tabular-nums text-[var(--color-text-muted)]">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
