import { ListMusic, Maximize2, Volume2, VolumeX } from "lucide-react";
import type { Track } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";
import { IconButton } from "@/components/common/IconButton";
import { PlayerControls } from "@/components/player/PlayerControls";
import { ProgressBar } from "@/components/player/ProgressBar";
import { Slider } from "@/components/common/Slider";
import { usePlayback } from "@/hooks/usePlayback";
import { useMuteMemory } from "@/hooks/useMuteMemory";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";
import { cn } from "@/utils/cn";

export interface MiniPlayerProps {
  onExpand: () => void;
  onOpenQueue: () => void;
}

/**
 * Bottom-mounted player. Presentational only — every transport action
 * flows through `usePlayback` so the queue, player store and provider
 * stay synchronised.
 */
export function MiniPlayer({ onExpand, onOpenQueue }: MiniPlayerProps) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);

  const queueLength = useQueueStore((state) => state.tracks.length);

  const playback = usePlayback();
  const mute = useMuteMemory();

  const hasTrack = currentTrack !== null;
  const isPlaying = status === "playing";

  return (
    <div
      className="relative flex h-full flex-col gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2.5"
      data-state={status}
    >
      <div className="flex items-center gap-5">
        <NowPlaying track={currentTrack} status={status} isPlaying={isPlaying} />
        <PlayerControls
          isPlaying={isPlaying}
          disabled={!hasTrack}
          onTogglePlay={() => {
            void playback.togglePlay();
          }}
          onNext={() => {
            void playback.next();
          }}
          onPrevious={() => {
            void playback.previous();
          }}
        />
        <div className="ml-auto flex items-center gap-2">
          <VolumeInline
            volume={volume}
            onToggleMute={() => {
              void mute.toggle();
            }}
            onVolumeChange={(value) => {
              void playback.setVolume(value);
            }}
          />
          <IconButton
            label={`Queue (${queueLength})`}
            size="sm"
            tone="subtle"
            onClick={onOpenQueue}
          >
            <ListMusic size={16} aria-hidden="true" />
          </IconButton>
          <IconButton label="Fullscreen player" size="sm" tone="subtle" onClick={onExpand}>
            <Maximize2 size={16} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      <ProgressBar
        position={position}
        duration={duration}
        onSeek={(value) => {
          void playback.seek(value);
        }}
      />
    </div>
  );
}

interface NowPlayingProps {
  track: Track | null;
  status: ReturnType<typeof usePlayerStore.getState>["status"];
  isPlaying: boolean;
}

/**
 * Current-track styling reflects the playback status. Only `playing`
 * uses the chromatic accent; `loading` keeps the accent but adds the
 * small spinner affordance later, `paused` falls back to primary text,
 * `error` shows a subtle danger hint, and `idle` shows neutral text.
 */
function NowPlaying({ track, status, isPlaying }: NowPlayingProps) {
  if (!track) {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <Artwork alt="Nothing playing" size={44} seedKey="empty" rounded="md" />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm text-[var(--color-text-secondary)]">
            Nothing playing
          </span>
          <span className="truncate text-xs text-[var(--color-text-muted)]">
            Pick something to play
          </span>
        </div>
      </div>
    );
  }
  const titleClass = cn(
    "truncate text-sm",
    status === "error"
      ? "text-[var(--color-danger)]"
      : status === "loading"
        ? "text-[var(--color-album-accent)] opacity-80"
        : isPlaying
          ? "text-[var(--color-album-accent)]"
          : "text-[var(--color-text-primary)]",
  );
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Artwork
        src={track.artworkUrl ?? track.album?.artworkUrl}
        alt={track.album?.title ?? track.title}
        size={44}
        seedKey={track.album?.id ?? track.id}
        rounded="md"
      />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className={titleClass}>{track.title}</span>
        <span className="truncate text-xs text-[var(--color-text-secondary)]">
          {track.artist.name}
        </span>
      </div>
    </div>
  );
}

interface VolumeInlineProps {
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
}

function VolumeInline({ volume, onToggleMute, onVolumeChange }: VolumeInlineProps) {
  const muted = volume === 0;
  return (
    <div className="hidden items-center gap-2 md:flex">
      <IconButton label={muted ? "Unmute" : "Mute"} size="sm" tone="subtle" onClick={onToggleMute}>
        {muted ? (
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
