import { type ReactNode, useEffect, useMemo } from "react";
import type {
  MusicAuthProvider,
  MusicCatalogProvider,
  MusicProvider,
  PlaybackBackend,
} from "@/domain/ports";
import { MockAuthProvider } from "@/infrastructure/mock/MockAuthProvider";
import { MockMusicProvider } from "@/infrastructure/mock/MockMusicProvider";
import { TidalAuthProvider } from "@/infrastructure/tidal/auth/TidalAuthProvider";
import { TidalCatalogProvider } from "@/infrastructure/tidal/api/TidalCatalogProvider";
import {
  MusicAuthContext,
  MusicCatalogContext,
  MusicProviderContext,
  PlaybackBackendContext,
} from "./useMusicProvider";

export interface MusicProviderProviderProps {
  children: ReactNode;
  /** Compatibility/test injection for one object implementing both ports. */
  provider?: MusicProvider;
  catalogProvider?: MusicCatalogProvider;
  playbackBackend?: PlaybackBackend;
  authProvider?: MusicAuthProvider;
}

export function MusicProviderProvider({
  children,
  provider,
  catalogProvider,
  playbackBackend,
  authProvider,
}: MusicProviderProviderProps) {
  const mock = useMemo(() => new MockMusicProvider(), []);
  const source = import.meta.env.VITE_MUSIC_SOURCE;
  const tidalAuth = useMemo(
    () =>
      new TidalAuthProvider({
        clientId: import.meta.env.VITE_TIDAL_CLIENT_ID ?? "",
        redirectUri: import.meta.env.VITE_TIDAL_REDIRECT_URI ?? "",
        scopes: (import.meta.env.VITE_TIDAL_SCOPES ?? "").split(",").filter(Boolean),
      }),
    [],
  );
  const tidalCatalog = useMemo(() => new TidalCatalogProvider(), []);

  const legacyProvider = provider ?? mock;
  const catalog =
    catalogProvider ?? (provider ? provider : source === "tidal" ? tidalCatalog : mock);
  const playback = playbackBackend ?? provider ?? mock;
  const mockAuth = useMemo(() => new MockAuthProvider(), []);
  const auth = authProvider ?? (source === "tidal" ? tidalAuth : mockAuth);

  useEffect(() => {
    void auth.initialize();
  }, [auth]);

  return (
    <MusicProviderContext.Provider value={{ provider: legacyProvider }}>
      <MusicCatalogContext.Provider value={catalog}>
        <PlaybackBackendContext.Provider value={playback}>
          <MusicAuthContext.Provider value={auth}>{children}</MusicAuthContext.Provider>
        </PlaybackBackendContext.Provider>
      </MusicCatalogContext.Provider>
    </MusicProviderContext.Provider>
  );
}
