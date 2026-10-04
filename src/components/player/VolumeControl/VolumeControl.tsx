import { Volume2, VolumeX } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";
import { Slider } from "@/components/common/Slider";

export interface VolumeControlProps {
  volume: number;
  /** Whether the volume is effectively muted. Defaults to `volume === 0`. */
  muted?: boolean;
  onToggleMute?: () => void;
  onVolumeChange: (value: number) => void;
}

/**
 * Inline volume control. The toggle / mute behaviour is delegated to
 * the caller (typically `useMuteMemory`) so that the previous volume
 * level can be restored.
 */
export function VolumeControl({ volume, muted, onToggleMute, onVolumeChange }: VolumeControlProps) {
  const isMuted = muted ?? volume === 0;
  const handleToggle = onToggleMute ?? (() => onVolumeChange(isMuted ? 0.8 : 0));

  return (
    <div className="flex items-center gap-2">
      <IconButton
        label={isMuted ? "Unmute" : "Mute"}
        size="sm"
        tone="subtle"
        onClick={handleToggle}
      >
        {isMuted ? (
          <VolumeX size={16} aria-hidden="true" />
        ) : (
          <Volume2 size={16} aria-hidden="true" />
        )}
      </IconButton>
      <div className="w-24">
        <Slider
          ariaLabel="Volume"
          value={volume}
          min={0}
          max={1}
          step={0.01}
          onChange={onVolumeChange}
        />
      </div>
    </div>
  );
}
