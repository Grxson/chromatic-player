import { Heart, Pause, Play } from "lucide-react";
import type { Track } from "@/domain/entities";
import { useLibraryStore } from "@/stores";
import { Artwork } from "@/components/music/Artwork";
import { IconButton } from "@/components/common/IconButton";
import { formatDuration } from "@/utils/time";
import { cn } from "@/utils/cn";

export interface TrackRowProps {
  track: Track;
  index?: number;
  onPlay?: (track: Track) => void;
  isCurrent?: boolean;
  isPlaying?: boolean;
}

/**
 * One row in a track list. The component is presentational and never
 * touches the stores directly except for the read-only "liked" flag
 * (so the heart can be rendered in the correct state).
 */
export function TrackRow({
  track,
  index,
  onPlay,
  isCurrent = false,
  isPlaying = false,
}: TrackRowProps) {
  const liked = useLibraryStore((state) => state.likedTrackIds.includes(track.id));
  const toggleLike = useLibraryStore((state) => state.toggleLikeTrack);

  const showIndex = typeof index === "number";
  const canPlay = typeof onPlay === "function";

  return (
    <div
      role="row"
      className={cn(
        "group grid grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-md px-3 py-2 transition-colors duration-150",
        isCurrent
          ? "bg-[var(--color-surface-2)]"
          : "hover:bg-[var(--color-surface)] focus-within:bg-[var(--color-surface)]",
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center text-xs text-[var(--color-text-muted)]">
        {showIndex ? (
          <>
            <span className={cn("tabular-nums", isCurrent && "text-[var(--color-album-accent)]")}>
              {(index ?? 0) + 1}
            </span>
            {canPlay ? (
              <button
                type="button"
                onClick={() => onPlay(track)}
                aria-label={`Play ${track.title}`}
                className="absolute hidden h-6 w-6 items-center justify-center text-[var(--color-text-primary)] group-hover:flex group-focus-within:flex"
              >
                {isCurrent && isPlaying ? (
                  <Pause size={14} aria-hidden="true" />
                ) : (
                  <Play size={14} aria-hidden="true" />
                )}
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      <Artwork
        src={track.artworkUrl ?? track.album?.artworkUrl}
        alt={track.album?.title ?? track.title}
        size={40}
        seedKey={track.album?.id ?? track.id}
        rounded="md"
      />

      <div className="min-w-0">
        <div
          className={cn(
            "truncate text-sm",
            isCurrent ? "text-[var(--color-album-accent)]" : "text-[var(--color-text-primary)]",
          )}
        >
          {track.title}
        </div>
        <div className="truncate text-xs text-[var(--color-text-secondary)]">
          {track.artist.name}
        </div>
      </div>

      <div className="hidden truncate text-xs text-[var(--color-text-secondary)] md:block">
        {track.album?.title ?? "—"}
      </div>

      <IconButton
        label={liked ? "Unlike" : "Like"}
        size="sm"
        tone="subtle"
        aria-pressed={liked}
        onClick={() => {
          toggleLike(track.id);
        }}
      >
        <Heart
          size={14}
          fill={liked ? "currentColor" : "none"}
          className={liked ? "text-[var(--color-album-accent)]" : ""}
          aria-hidden="true"
        />
      </IconButton>

      <span className="w-10 text-right text-xs tabular-nums text-[var(--color-text-muted)]">
        {formatDuration(track.duration)}
      </span>
    </div>
  );
}
