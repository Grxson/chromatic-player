import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import type { ViewKey } from "@/components/layout/Sidebar";
import { AlbumPage } from "@/pages/AlbumPage";
import { ArtistPage } from "@/pages/ArtistPage";
import { FullscreenPlayerPage } from "@/pages/FullscreenPlayerPage";
import { HomePage } from "@/pages/HomePage";
import { LibraryPage } from "@/pages/LibraryPage";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { QueueDrawer } from "@/features/queue/QueueDrawer";
import { useRouter } from "@/app/router/useRouter";
import { isViewKey } from "@/app/router/router";
import { usePlayerStore } from "@/stores/player.store";
import { useChromaticTheme } from "@/features/chromatic";

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
  // The hook is a no-op when nothing is playing.
  useChromaticTheme(currentTrack?.album?.id ?? null);

  const [queueOpen, setQueueOpen] = useState(false);

  const view: ViewKey = route.type === "view" && isViewKey(route.view) ? route.view : "home";

  const body =
    route.type === "view" ? (
      renderView(view)
    ) : route.type === "album" ? (
      <AlbumPage albumId={route.id} />
    ) : route.type === "artist" ? (
      <ArtistPage artistId={route.id} />
    ) : (
      <FullscreenPlayerPage onMinimize={() => navigate({ type: "view", view: "home" })} />
    );

  return (
    <AppShell
      currentView={view}
      onNavigate={(next) => navigate({ type: "view", view: next })}
      onExpandPlayer={() => navigate({ type: "fullscreen" })}
      onOpenQueue={() => setQueueOpen(true)}
    >
      {body}
      <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />
    </AppShell>
  );
}

function renderView(view: ViewKey) {
  const Page = VIEW_PAGES[view];
  return <Page />;
}
