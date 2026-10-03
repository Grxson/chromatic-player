import { Volume2, VolumeX } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";
import { Slider } from "@/components/common/Slider";

export interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const muted = volume === 0;

  return (
    <div className="flex items-center gap-2">
      <IconButton
        label={muted ? "Unmute" : "Mute"}
        size="sm"
        tone="subtle"
        onClick={() => onVolumeChange(muted ? 0.8 : 0)}
      >
        {muted ? (
          <VolumeX size={16} aria-hidden="true" />
        ) : (
          <Volume2 size={16} aria-hidden="true" />
        )}
      </IconButton>
      <div className="hidden w-24 sm:block">
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
