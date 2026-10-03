import { Maximize2 } from "lucide-react";
import type { Track } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";
import { IconButton } from "@/components/common/IconButton";
import { PlayerControls } from "@/components/player/PlayerControls";
import { ProgressBar } from "@/components/player/ProgressBar";
import { VolumeControl } from "@/components/player/VolumeControl";
import { QueueButton } from "@/components/player/QueueButton";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";

export interface MiniPlayerProps {
  onExpand: () => void;
}

/**
 * Mini player. It is intentionally presentational — every action goes
 * through the playback layer (`usePlayback`) so the queue, the player
 * store and the provider stay synchronised.
 */
export function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);

  const queueLength = useQueueStore((state) => state.tracks.length);

  const playback = usePlayback();
  const hasTrack = currentTrack !== null;

  return (
    <div className="flex h-full flex-col gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      <div className="flex items-center gap-4">
        <TrackArtwork track={currentTrack} />
        <TrackMeta track={currentTrack} />
        <div className="flex-1" />
        <PlayerControls
          isPlaying={status === "playing"}
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
        <div className="hidden items-center gap-2 md:flex">
          <VolumeControl
            volume={volume}
            onVolumeChange={(value) => {
              void playback.setVolume(value);
            }}
          />
          <QueueButton queueLength={queueLength} />
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

function TrackArtwork({ track }: { track: Track | null }) {
  if (!track) {
    return <Artwork alt="Nothing playing" size={48} rounded="md" />;
  }
  return (
    <Artwork
      src={track.artworkUrl ?? track.album?.artworkUrl}
      alt={track.album?.title ?? track.title}
      size={48}
      rounded="md"
    />
  );
}

function TrackMeta({ track }: { track: Track | null }) {
  if (!track) {
    return (
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm text-[var(--color-text-secondary)]">Nothing playing</span>
        <span className="truncate text-xs text-[var(--color-text-muted)]">
          Pick something to play
        </span>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-sm text-[var(--color-text-primary)]">{track.title}</span>
      <span className="truncate text-xs text-[var(--color-text-secondary)]">
        {track.artist.name}
      </span>
    </div>
  );
}
