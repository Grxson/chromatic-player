import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import type { ViewKey } from "@/components/layout/Sidebar";
import { AlbumPage } from "@/pages/AlbumPage";
import { ArtistPage } from "@/pages/ArtistPage";
import { PlaylistPage } from "@/pages/PlaylistPage";
import { FullscreenPlayerPage } from "@/pages/FullscreenPlayerPage";
import { HomePage } from "@/pages/HomePage";
import { LibraryPage } from "@/pages/LibraryPage";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { QueueDrawer } from "@/features/queue/QueueDrawer";
import { useRouter } from "@/app/router/useRouter";
import { isViewKey } from "@/app/router/router";
import type { Route } from "@/app/router/router";
import { usePlayerStore } from "@/stores/player.store";
import { useChromaticTheme } from "@/features/chromatic";
import { usePlayerShortcuts } from "@/hooks/usePlayerShortcuts";

const VIEW_PAGES: Record<ViewKey, () => React.JSX.Element> = {
  home: HomePage,
  search: SearchPage,
  library: LibraryPage,
  settings: SettingsPage,
};

export function App() {
  const { route, navigate } = useRouter();
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  // Apply the chromatic theme variables whenever the playing track changes.
  useChromaticTheme(currentTrack?.album?.id ?? null);

  const [queueOpen, setQueueOpen] = useState(false);

  // Remember the last non-fullscreen route so Escape / minimize return
  // to where the user was, instead of always falling back to Home.
  const previousRouteRef = useRef<Route | null>(null);

  const enterFullscreen = useCallback(() => {
    if (route.type !== "fullscreen") {
      previousRouteRef.current = route;
    }
    navigate({ type: "fullscreen" });
  }, [route, navigate]);

  const exitFullscreen = useCallback(() => {
    const previous = previousRouteRef.current ?? { type: "view", view: "home" };
    previousRouteRef.current = null;
    navigate(previous);
  }, [navigate]);

  const view: ViewKey = route.type === "view" && isViewKey(route.view) ? route.view : "home";

  const body =
    route.type === "view" ? (
      renderView(view)
    ) : route.type === "album" ? (
      <AlbumPage albumId={route.id} />
    ) : route.type === "artist" ? (
      <ArtistPage artistId={route.id} />
    ) : route.type === "playlist" ? (
      <PlaylistPage playlistId={route.id} />
    ) : (
      <FullscreenPlayerPage onMinimize={exitFullscreen} />
    );

  const openQueue = useCallback(() => {
    setQueueOpen(true);
  }, []);
  const closeQueue = useCallback(() => {
    setQueueOpen(false);
  }, []);

  usePlayerShortcuts({
    route,
    queueOpen,
    onOpenQueue: openQueue,
    onCloseQueue: closeQueue,
    onOpenFullscreen: enterFullscreen,
    onCloseFullscreen: exitFullscreen,
  });

  return (
    <AppShell
      currentView={view}
      onNavigate={(next) => navigate({ type: "view", view: next })}
      onExpandPlayer={enterFullscreen}
      onOpenQueue={openQueue}
    >
      {body}
      <QueueDrawer open={queueOpen} onClose={closeQueue} />
    </AppShell>
  );
}

function renderView(view: ViewKey) {
  const Page = VIEW_PAGES[view];
  return <Page />;
}
