import { useCallback, useMemo } from "react";
import { Library, Music2, Play, Search as SearchIcon } from "lucide-react";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { AlbumCard } from "@/components/music/AlbumCard";
import { ArtistCard } from "@/components/music/ArtistCard";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { TrackRow } from "@/components/music/TrackRow";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useCatalogProvider } from "@/app/providers/useMusicProvider";
import { useAuthStore } from "@/stores/auth.store";
import { usePlayback } from "@/hooks/usePlayback";
import { useRouter } from "@/app/router/useRouter";
import { usePlayerStore } from "@/stores/player.store";
import { useLocalLibraryStore } from "@/stores/localLibrary.store";
import type { Album, Artist, Playlist, Track } from "@/domain/entities";

interface HomeData {
  recent: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  albumTracks: Record<string, Track[]>;
  moreAlbums: Album[];
  moreTracks: Track[];
}

const PLACEHOLDER: HomeData = {
  recent: [],
  albums: [],
  artists: [],
  playlists: [],
  albumTracks: {},
  moreAlbums: [],
  moreTracks: [],
};

export function HomePage() {
  const provider = useCatalogProvider();
  const playback = usePlayback();
  const { navigate } = useRouter();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const playerStatus = usePlayerStore((state) => state.status);
  const localTracks = useLocalLibraryStore((state) => state.tracks);
  const authStatus = useAuthStore((state) => state.status);

  const loader = useCallback(async (): Promise<HomeData> => {
    const all = await provider.search("", 50);
    const tracks = all.tracks ?? [];
    const albums = all.albums ?? [];
    const artists = all.artists ?? [];
    const playlists = all.playlists ?? [];

    // Pre-resolve album tracks so the Hero "Play" button can dispatch a
    // real contextual queue instead of a single-track play.
    const albumIds = albums.slice(0, 1).map((a) => a.id);
    const tracksByAlbum = await Promise.all(
      albumIds.map(async (id) => {
        try {
          const tracks = await provider.getAlbumTracks(id);
          return [id, tracks] as const;
        } catch (error) {
          console.error("Home album tracks request failed", error);
          return [id, [] as Track[]] as const;
        }
      }),
    );
    const albumTracks: Record<string, Track[]> = {};
    for (const [id, t] of tracksByAlbum) {
      albumTracks[id] = t;
    }

    return {
      recent: tracks.slice(0, 6),
      albums: albums.slice(0, 6),
      artists: artists.slice(0, 6),
      playlists: playlists.slice(0, 5),
      albumTracks,
      moreAlbums: albums.slice(0, 10),
      moreTracks: tracks.slice(0, 10),
    };
  }, [provider]);

  const { status, data, retry } = useAsyncResource<HomeData>("home", loader);
  const view = data ?? PLACEHOLDER;
  const loading = status === "loading" || status === "idle";

  const heroAlbum = view.albums[0];
  const heroAlbumTracks = useMemo(
    () => (heroAlbum ? (view.albumTracks[heroAlbum.id] ?? []) : []),
    [heroAlbum, view.albumTracks],
  );
  const heroTracks = useMemo(() => view.recent.slice(0, 5), [view.recent]);
  const handleHeroPlay = useCallback(() => {
    if (heroAlbumTracks.length === 0 || !heroAlbum) {
      return;
    }
    void playback.playQueue(heroAlbumTracks, 0);
  }, [heroAlbumTracks, heroAlbum, playback]);

  if (provider.name === "tidal-catalog") {
    return (
      <>
        <Header
          eyebrow="Your listening space"
          title="Home"
          subtitle="Explore TIDAL's catalogue or play music stored on this device."
        />
        <Content>
          <div className="mx-auto flex max-w-5xl flex-col gap-10">
            <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 sm:p-9">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  background:
                    "radial-gradient(60% 100% at 0% 50%, var(--chromatic-glow-primary), transparent 65%)",
                }}
              />
              <div className="relative max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                  Chromatic Player
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                  Music first. Your sources, separate.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  {authStatus === "authenticated"
                    ? "Explore TIDAL's catalogue. Full TIDAL audio isn't available in this build; local audio plays on this device."
                    : "Connect TIDAL to explore its catalogue, or add music stored on this device. TIDAL audio isn't available in this build."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      navigate({
                        type: "view",
                        view: authStatus === "authenticated" ? "search" : "settings",
                      })
                    }
                  >
                    <SearchIcon size={15} aria-hidden="true" />
                    {authStatus === "authenticated" ? "Search TIDAL" : "Connect TIDAL"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate({ type: "view", view: "library" })}
                  >
                    <Library size={15} aria-hidden="true" />
                    Open local library
                  </Button>
                </div>
              </div>
            </section>

            <section aria-labelledby="home-local-heading" className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2
                    id="home-local-heading"
                    className="text-lg font-medium text-[var(--color-text-primary)]"
                  >
                    Local music
                  </h2>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {localTracks.length > 0
                      ? `${localTracks.length} track${localTracks.length === 1 ? "" : "s"} in this session`
                      : "Files you choose stay on this device."}
                  </p>
                </div>
                {localTracks.length > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ type: "view", view: "library" })}
                  >
                    View library
                  </Button>
                ) : null}
              </div>
              {localTracks.length === 0 ? (
                <EmptyState
                  icon={<Music2 size={20} aria-hidden="true" />}
                  title="Start with your own music"
                  description="Choose local audio files to build a private, session-only library."
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => navigate({ type: "view", view: "library" })}
                    >
                      <Library size={15} aria-hidden="true" />
                      Add music
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-1">
                  {localTracks.slice(0, 8).map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isCurrent={currentTrack?.id === track.id}
                      isPlaying={playerStatus === "playing" && currentTrack?.id === track.id}
                      onPlay={() => void playback.playQueue(localTracks, index)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </Content>
      </>
    );
  }

  return (
    <>
      <Header
        eyebrow={provider.name === "tidal-catalog" ? "TIDAL catalogue" : "Welcome back"}
        title={provider.name === "tidal-catalog" ? "Connected to TIDAL" : "Good evening"}
        subtitle={
          provider.name === "tidal-catalog"
            ? "Browse TIDAL's catalogue and play audio files from your local library."
            : "A quiet session of the catalogue."
        }
      />
      <Content>
        {status === "error" ? (
          <div
            role="alert"
            className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
          >
            <p className="text-sm text-[var(--color-text-secondary)]">
              Couldn't load the catalogue. Check your connection and try again.
            </p>
            <Button variant="secondary" size="sm" onClick={retry}>
              Retry
            </Button>
          </div>
        ) : null}
        {provider.name === "tidal-catalog" ? (
          <section className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div>
              <h2 className="text-base font-medium text-[var(--color-text-primary)]">
                {authStatus === "authenticated"
                  ? "Search the TIDAL catalogue"
                  : "Connect your TIDAL account"}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {authStatus === "authenticated"
                  ? "Search for artists, albums, tracks and playlists."
                  : "Open Settings to configure and connect TIDAL."}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate({
                  type: "view",
                  view: authStatus === "authenticated" ? "search" : "settings",
                })
              }
              className="rounded-md bg-[var(--color-album-accent)] px-4 py-2 text-sm font-medium text-[var(--color-canvas)]"
            >
              {authStatus === "authenticated" ? "Search" : "Open Settings"}
            </button>
          </section>
        ) : null}
        <div className="space-y-12">
          {heroAlbum ? (
            <Hero
              album={heroAlbum}
              onPlay={handleHeroPlay}
              canPlay={provider.name !== "tidal-catalog" && heroAlbumTracks.length > 0}
            />
          ) : null}

          <Section
            title="Recently played"
            subtitle="Pick up where you left off."
            loading={loading && view.recent.length === 0}
          >
            <div className="space-y-1">
              {heroTracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={playerStatus === "playing" && currentTrack?.id === track.id}
                  onPlay={
                    provider.name === "tidal-catalog"
                      ? undefined
                      : () => void playback.playQueue(heroTracks, index)
                  }
                />
              ))}
            </div>
          </Section>

          <Section
            title="Albums"
            subtitle="A few quiet selections."
            loading={loading && view.albums.length === 0}
          >
            <Grid>
              {view.albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onOpen={(a) => {
                    navigate({ type: "album", id: a.id });
                  }}
                />
              ))}
            </Grid>
          </Section>

          <Section
            title="Artists"
            subtitle="The people behind the music."
            loading={loading && view.artists.length === 0}
          >
            <Grid>
              {view.artists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onOpen={(a) => {
                    navigate({ type: "artist", id: a.id });
                  }}
                />
              ))}
            </Grid>
          </Section>

          <Section
            title="Playlists"
            subtitle="Curated quiet rotations."
            loading={loading && view.playlists.length === 0}
          >
            <Grid>
              {view.playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onOpen={(item) => navigate({ type: "playlist", id: item.id })}
                />
              ))}
            </Grid>
          </Section>

          <Section
            title="More to explore"
            subtitle="Continue browsing the catalogue."
            loading={loading && view.moreAlbums.length === 0}
          >
            <Grid>
              {view.moreAlbums.slice(3).map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onOpen={(a) => {
                    navigate({ type: "album", id: a.id });
                  }}
                />
              ))}
            </Grid>
          </Section>

          <Section
            title="More tracks"
            subtitle="Pick something fresh."
            loading={loading && view.moreTracks.length === 0}
          >
            <div className="space-y-1">
              {view.moreTracks.slice(5).map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  isCurrent={currentTrack?.id === track.id}
                  onPlay={() => {
                    void playback.playQueue(view.moreTracks.slice(5), index);
                  }}
                />
              ))}
            </div>
          </Section>
        </div>
      </Content>
    </>
  );
}

interface HeroProps {
  album: Album;
  onPlay: () => void;
  canPlay: boolean;
}

function Hero({ album, onPlay, canPlay }: HeroProps) {
  const { navigate } = useRouter();
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 100% at 0% 50%, var(--chromatic-glow-primary), transparent 60%), radial-gradient(50% 80% at 100% 0%, var(--chromatic-glow-secondary), transparent 70%)",
        }}
      />
      <div className="relative flex items-center gap-7">
        <div className="hidden h-32 w-32 shrink-0 sm:block">
          <div className="relative h-full w-full">
            <div
              className="absolute inset-0 rounded-xl shadow-xl"
              style={{
                background: "linear-gradient(135deg, var(--album-accent), var(--album-secondary))",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[var(--color-canvas)]/35">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-text-primary)]/80">
                Chromatic
              </span>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Featured album
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
            {album.title}
          </h2>
          <p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
            {album.artists.map((a) => a.name).join(", ")} · {album.trackCount} tracks
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPlay}
              disabled={!canPlay}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-album-accent)] px-5 py-2 text-sm font-medium text-[var(--color-canvas)] hover:brightness-110 disabled:opacity-50"
            >
              <Play size={16} aria-hidden="true" className="translate-x-[1px]" />
              Play
            </button>
            <button
              type="button"
              onClick={() => {
                navigate({ type: "album", id: album.id });
              }}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-transparent px-5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
            >
              Open album
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({
  title,
  subtitle,
  loading,
  children,
}: {
  title: string;
  subtitle?: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
          {subtitle ? <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p> : null}
        </div>
      </div>
      {loading ? <SkeletonGrid /> : children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">{children}</div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      ))}
    </div>
  );
}
