import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";

export interface PlayerControlsProps {
  isPlaying: boolean;
  disabled?: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PlayerControls({
  isPlaying,
  disabled,
  onTogglePlay,
  onNext,
  onPrevious,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <IconButton label="Previous" size="sm" tone="subtle" onClick={onPrevious} disabled={disabled}>
        <SkipBack size={16} aria-hidden="true" />
      </IconButton>

      <IconButton
        label={isPlaying ? "Pause" : "Play"}
        size="md"
        tone="primary"
        onClick={onTogglePlay}
        disabled={disabled}
      >
        {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </IconButton>

      <IconButton label="Next" size="sm" tone="subtle" onClick={onNext} disabled={disabled}>
        <SkipForward size={16} aria-hidden="true" />
      </IconButton>
    </div>
  );
}
