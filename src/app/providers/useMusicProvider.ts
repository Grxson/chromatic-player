import { createContext, useContext } from "react";
import type { MusicProvider } from "@/domain/ports";

interface MusicProviderContextValue {
  provider: MusicProvider;
}

export const MusicProviderContext = createContext<MusicProviderContextValue | null>(null);

export function useMusicProvider(): MusicProvider {
  const ctx = useContext(MusicProviderContext);
  if (!ctx) {
    throw new Error("useMusicProvider must be used inside <MusicProviderProvider>");
  }
  return ctx.provider;
}
