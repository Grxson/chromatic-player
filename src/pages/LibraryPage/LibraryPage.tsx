import { useCallback, useMemo, useState } from "react";
import { Heart, Library, Plus } from "lucide-react";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { TrackRow } from "@/components/music/TrackRow";
import { AlbumCard } from "@/components/music/AlbumCard";
import { ArtistCard } from "@/components/music/ArtistCard";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button/Button";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useCatalogProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { useRouter } from "@/app/router/useRouter";
import { useLibraryStore } from "@/stores/library.store";
import { usePlayerStore } from "@/stores/player.store";
import { cn } from "@/utils/cn";
import { mapLocalFile } from "@/infrastructure/local/localTrack";
import { useLocalLibraryStore } from "@/stores/localLibrary.store";
import type { Album, Artist, Playlist, Track } from "@/domain/entities";

type Tab = "local" | "tracks" | "albums" | "artists" | "playlists";

interface LibraryData {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

const TABS: { key: Tab; label: string }[] = [
  { key: "local", label: "Local music" },
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
  const provider = useCatalogProvider();
  const playback = usePlayback();
  const { navigate } = useRouter();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);

  const likedTrackIds = useLibraryStore((state) => state.likedTrackIds);
  const savedAlbumIds = useLibraryStore((state) => state.savedAlbumIds);
  const followedArtistIds = useLibraryStore((state) => state.followedArtistIds);
  const localTracks = useLocalLibraryStore((state) => state.tracks);
  const addImported = useLocalLibraryStore((state) => state.addImported);

  const loader = useCallback(() => loadLibrary(provider), [provider]);
  const { status: loadStatus, data, retry } = useAsyncResource<LibraryData>("library", loader);
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

  const [tab, setTab] = useState<Tab>("local");
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const counts = {
    local: localTracks.length,
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
        subtitle="Your local music alongside saved TIDAL albums and artists."
      />
      <Content>
        {loadStatus === "error" ? (
          <div
            role="alert"
            className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
          >
            <p className="text-sm text-[var(--color-text-secondary)]">
              Couldn't load saved catalogue items. Local music is still available.
            </p>
            <Button variant="secondary" size="sm" onClick={retry}>
              Retry
            </Button>
          </div>
        ) : null}
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

          {tab === "local" ? (
            <section aria-label="Local music" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                    Local tracks
                  </h2>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Files stay on this device and are available for this session.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-2)]">
                  <Plus size={15} aria-hidden="true" />
                  {isImporting ? "Adding…" : "Add files"}
                  <input
                    type="file"
                    multiple
                    accept=".mp3,.flac,.wav,.m4a,.aac,.ogg,audio/*"
                    disabled={isImporting}
                    className="sr-only"
                    aria-label="Add local audio files"
                    onChange={(event) => {
                      const files = Array.from(event.currentTarget.files ?? []);
                      event.currentTarget.value = "";
                      if (files.length === 0) return;
                      setIsImporting(true);
                      setImportMessage(null);
                      void (async () => {
                        const imported = [];
                        let failed = 0;
                        for (const file of files) {
                          try {
                            imported.push(await mapLocalFile(file));
                          } catch {
                            failed += 1;
                          }
                        }
                        addImported(imported);
                        setImportMessage(
                          failed > 0
                            ? `${imported.length} added · ${failed} file${failed === 1 ? "" : "s"} could not be read.`
                            : `${imported.length} track${imported.length === 1 ? "" : "s"} added.`,
                        );
                        setIsImporting(false);
                      })();
                    }}
                  />
                </label>
              </div>
              {importMessage ? (
                <p role="status" className="text-xs text-[var(--color-text-secondary)]">
                  {importMessage}
                </p>
              ) : null}
              {localTracks.length === 0 ? (
                <EmptyState
                  icon={<Library size={20} aria-hidden="true" />}
                  title="Your local library is empty"
                  description="Choose audio files from your device to start listening."
                />
              ) : (
                <div className="space-y-1">
                  {localTracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isCurrent={currentTrack?.id === track.id}
                      isPlaying={status === "playing" && currentTrack?.id === track.id}
                      onPlay={() => void playback.playQueue(localTracks, index)}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

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
                    onPlay={
                      provider.name === "tidal-catalog"
                        ? undefined
                        : () => void playback.playQueue(tracks, index)
                    }
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
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onOpen={(item) => navigate({ type: "playlist", id: item.id })}
                  />
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

async function loadLibrary(provider: ReturnType<typeof useCatalogProvider>): Promise<LibraryData> {
  const all = await provider.search("", 50);
  return {
    tracks: all.tracks ?? [],
    albums: all.albums ?? [],
    artists: all.artists ?? [],
    playlists: all.playlists ?? [],
  };
}
