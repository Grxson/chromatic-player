import { useCallback, useMemo, useState } from "react";
import { Heart, Library } from "lucide-react";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { TrackRow } from "@/components/music/TrackRow";
import { AlbumCard } from "@/components/music/AlbumCard";
import { ArtistCard } from "@/components/music/ArtistCard";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useMusicProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { useRouter } from "@/app/router/useRouter";
import { useLibraryStore } from "@/stores/library.store";
import { usePlayerStore } from "@/stores/player.store";
import { cn } from "@/utils/cn";
import type { Album, Artist, Playlist, Track } from "@/domain/entities";

type Tab = "tracks" | "albums" | "artists" | "playlists";

interface LibraryData {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

const TABS: { key: Tab; label: string }[] = [
  { key: "tracks", label: "Tracks" },
  { key: "albums", label: "Albums" },
  { key: "artists", label: "Artists" },
  { key: "playlists", label: "Playlists" },
];

const PLACEHOLDER: LibraryData = {
  tracks: [],
  albums: [],
  artists: [],
  playlists: [],
};

export function LibraryPage() {
  const provider = useMusicProvider();
  const playback = usePlayback();
  const { navigate } = useRouter();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);

  const likedTrackIds = useLibraryStore((state) => state.likedTrackIds);
  const savedAlbumIds = useLibraryStore((state) => state.savedAlbumIds);
  const followedArtistIds = useLibraryStore((state) => state.followedArtistIds);

  const loader = useCallback(() => loadLibrary(provider), [provider]);
  const { status: loadStatus, data } = useAsyncResource<LibraryData>("library", loader);
  const all = data ?? PLACEHOLDER;
  const loading = loadStatus === "loading" || loadStatus === "idle";

  const tracks = useMemo(
    () => all.tracks.filter((t) => likedTrackIds.includes(t.id)),
    [all.tracks, likedTrackIds],
  );
  const albums = useMemo(
    () => all.albums.filter((a) => savedAlbumIds.includes(a.id)),
    [all.albums, savedAlbumIds],
  );
  const artists = useMemo(
    () => all.artists.filter((a) => followedArtistIds.includes(a.id)),
    [all.artists, followedArtistIds],
  );
  const playlists = all.playlists;

  const [tab, setTab] = useState<Tab>("tracks");

  const counts = {
    tracks: likedTrackIds.length,
    albums: savedAlbumIds.length,
    artists: followedArtistIds.length,
    playlists: playlists.length,
  };

  const isPlayingThis = status === "playing";

  return (
    <>
      <Header
        eyebrow="Your collection"
        title="Library"
        subtitle="Liked tracks, saved albums and followed artists."
      />
      <Content>
        <div className="space-y-8">
          <div
            role="tablist"
            aria-label="Library sections"
            className="flex flex-wrap gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
          >
            {TABS.map((entry) => (
              <button
                key={entry.key}
                type="button"
                role="tab"
                aria-selected={tab === entry.key}
                onClick={() => {
                  setTab(entry.key);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs transition-colors duration-150",
                  tab === entry.key
                    ? "bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {entry.label}
                <span className="rounded-sm bg-[var(--color-elevated)] px-1.5 py-0.5 text-[10px] tabular-nums text-[var(--color-text-muted)]">
                  {counts[entry.key]}
                </span>
              </button>
            ))}
          </div>

          {tab === "tracks" ? (
            loading ? (
              <SkeletonList />
            ) : tracks.length === 0 ? (
              <EmptyState
                icon={<Heart size={20} aria-hidden="true" />}
                title="No liked tracks yet"
                description="Tap the heart on any track to keep it here."
              />
            ) : (
              <div className="space-y-1">
                {tracks.map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    isCurrent={currentTrack?.id === track.id}
                    isPlaying={isPlayingThis && currentTrack?.id === track.id}
                    onPlay={() => {
                      void playback.playQueue(tracks, index);
                    }}
                  />
                ))}
              </div>
            )
          ) : null}

          {tab === "albums" ? (
            albums.length === 0 ? (
              <EmptyState
                icon={<Library size={20} aria-hidden="true" />}
                title="No saved albums"
                description="Save albums to find them again quickly."
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onOpen={(a) => {
                      navigate({ type: "album", id: a.id });
                    }}
                  />
                ))}
              </div>
            )
          ) : null}

          {tab === "artists" ? (
            artists.length === 0 ? (
              <EmptyState
                icon={<Library size={20} aria-hidden="true" />}
                title="No followed artists"
                description="Follow artists to see them in your library."
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onOpen={(a) => {
                      navigate({ type: "artist", id: a.id });
                    }}
                  />
                ))}
              </div>
            )
          ) : null}

          {tab === "playlists" ? (
            playlists.length === 0 ? (
              <EmptyState
                icon={<Library size={20} aria-hidden="true" />}
                title="No playlists yet"
                description="Curated collections will appear here."
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )
          ) : null}
        </div>
      </Content>
    </>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

async function loadLibrary(provider: ReturnType<typeof useMusicProvider>): Promise<LibraryData> {
  const all = await provider.search("", 50);
  return {
    tracks: all.tracks ?? [],
    albums: all.albums ?? [],
    artists: all.artists ?? [],
    playlists: all.playlists ?? [],
  };
}
