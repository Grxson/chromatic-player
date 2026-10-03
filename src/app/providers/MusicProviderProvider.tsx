import { type ReactNode, useMemo } from "react";
import type { MusicProvider } from "@/domain/ports";
import { MockMusicProvider } from "@/infrastructure/mock/MockMusicProvider";
import { MusicProviderContext } from "./useMusicProvider";

export interface MusicProviderProviderProps {
  children: ReactNode;
  /**
   * Provide a custom provider for testing. Defaults to MockMusicProvider.
   * TidalProvider will be injected here in a later milestone.
   */
  provider?: MusicProvider;
}

export function MusicProviderProvider({ children, provider }: MusicProviderProviderProps) {
  const value = useMemo(() => ({ provider: provider ?? new MockMusicProvider() }), [provider]);

  return <MusicProviderContext.Provider value={value}>{children}</MusicProviderContext.Provider>;
}
