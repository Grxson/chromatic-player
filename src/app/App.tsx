import { AppShell } from "@/components/layout/AppShell";
import type { ViewKey } from "@/components/layout/Sidebar";
import { AlbumPage } from "@/pages/AlbumPage";
import { ArtistPage } from "@/pages/ArtistPage";
import { FullscreenPlayerPage } from "@/pages/FullscreenPlayerPage";
import { HomePage } from "@/pages/HomePage";
import { LibraryPage } from "@/pages/LibraryPage";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useRouter } from "@/app/router/useRouter";
import { isViewKey } from "@/app/router/router";

const VIEW_PAGES: Record<ViewKey, () => React.JSX.Element> = {
  home: HomePage,
  search: SearchPage,
  library: LibraryPage,
  settings: SettingsPage,
};

export function App() {
  const { route, navigate } = useRouter();

  const view: ViewKey = route.type === "view" && isViewKey(route.view) ? route.view : "home";

  let body: React.ReactNode;
  if (route.type === "view") {
    body = renderView(view);
  } else if (route.type === "album") {
    body = <AlbumPage albumId={route.id} />;
  } else if (route.type === "artist") {
    body = <ArtistPage artistId={route.id} />;
  } else {
    body = <FullscreenPlayerPage onMinimize={() => navigate({ type: "view", view: "home" })} />;
  }

  return (
    <AppShell
      currentView={view}
      onNavigate={(next) => navigate({ type: "view", view: next })}
      onExpandPlayer={() => navigate({ type: "fullscreen" })}
    >
      {body}
    </AppShell>
  );
}

function renderView(view: ViewKey) {
  const Page = VIEW_PAGES[view];
  return <Page />;
}
