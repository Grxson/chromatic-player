import { createContext, useContext } from "react";
import type {
  MusicAuthProvider,
  MusicCatalogProvider,
  MusicProvider,
  PlaybackBackend,
} from "@/domain/ports";

interface MusicProviderContextValue {
  provider: MusicProvider;
}

export const MusicProviderContext = createContext<MusicProviderContextValue | null>(null);
export const MusicCatalogContext = createContext<MusicCatalogProvider | null>(null);
export const PlaybackBackendContext = createContext<PlaybackBackend | null>(null);
export const MusicAuthContext = createContext<MusicAuthProvider | null>(null);

export function useMusicProvider(): MusicProvider {
  const ctx = useContext(MusicProviderContext);
  if (!ctx) {
    throw new Error("useMusicProvider must be used inside <MusicProviderProvider>");
  }
  return ctx.provider;
}

export function useCatalogProvider(): MusicCatalogProvider {
  const catalog = useContext(MusicCatalogContext);
  const legacy = useMusicProvider();
  return catalog ?? legacy;
}

export function usePlaybackBackend(): PlaybackBackend {
  const backend = useContext(PlaybackBackendContext);
  const legacy = useMusicProvider();
  return backend ?? legacy;
}

export function useMusicAuthProvider(): MusicAuthProvider {
  const provider = useContext(MusicAuthContext);
  if (!provider)
    throw new Error("useMusicAuthProvider must be used inside <MusicProviderProvider>");
  return provider;
}
