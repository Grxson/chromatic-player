import { LoaderCircle, Play } from "lucide-react";
import type { Album } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { cn } from "@/utils/cn";

export interface AlbumCardProps {
  album: Album;
  onOpen?: (album: Album) => void;
  onPlay?: (album: Album) => void;
  isLoading?: boolean;
}

/** Artwork-forward album tile shared by search and artist catalogue surfaces. */
export function AlbumCard({ album, onOpen, onPlay, isLoading = false }: AlbumCardProps) {
  const { motionEnabled } = useMotionPreference();
  const subtitle = album.artists.map((artist) => artist.name).join(", ");
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;

  return (
    <article className="group relative min-w-0">
      <button
        type="button"
        onClick={() => onOpen?.(album)}
        aria-label={`Open album ${album.title}`}
        className="flex w-full flex-col items-start gap-3 rounded-md p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-album-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]"
      >
        <Artwork
          src={album.artworkUrl}
          alt={album.title}
          size={220}
          fluid
          seedKey={album.id}
          rounded="md"
          className={cn(
            "aspect-square object-cover",
            motionEnabled &&
              "transition-[transform,filter] duration-200 ease-out group-hover:scale-[1.02] group-hover:brightness-105",
          )}
        />
        <span className="w-full min-w-0 px-1">
          <span className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-[var(--color-text-primary)]">
            {album.title}
          </span>
          <span className="block truncate text-xs text-[var(--color-text-secondary)]">
            {subtitle || "Unknown artist"}
            {releaseYear ? ` · ${releaseYear}` : ""}
          </span>
        </span>
      </button>

      {onPlay ? (
        <button
          type="button"
          onClick={() => onPlay(album)}
          disabled={isLoading}
          aria-label={`Play ${album.title}`}
          className={cn(
            "absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-canvas)]/90 text-[var(--color-text-primary)] shadow-lg backdrop-blur hover:bg-[var(--color-canvas)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-album-accent)] disabled:cursor-wait",
            motionEnabled && "transition-[opacity,transform] duration-200 hover:scale-105",
            "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
          )}
        >
          {isLoading ? (
            <LoaderCircle size={18} aria-hidden="true" className="animate-spin" />
          ) : (
            <Play size={17} aria-hidden="true" className="translate-x-px" />
          )}
        </button>
      ) : null}
    </article>
  );
}
