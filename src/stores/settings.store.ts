import { create } from "zustand";

export type AudioQuality = "LOW" | "HIGH" | "LOSSLESS" | "MAX";

export type ThemeMode = "dark";

export interface SettingsState {
  theme: ThemeMode;
  volume: number;
  animations: boolean;
  discordPresence: boolean;
  sidebarCollapsed: boolean;
  audioQuality: AudioQuality;

  setVolume: (volume: number) => void;
  setAnimations: (enabled: boolean) => void;
  setDiscordPresence: (enabled: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAudioQuality: (quality: AudioQuality) => void;
}

const INITIAL_VOLUME = 0.8;

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "dark",
  volume: INITIAL_VOLUME,
  animations: true,
  discordPresence: false,
  sidebarCollapsed: false,
  audioQuality: "MAX",

  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
  setAnimations: (animations) => set({ animations }),
  setDiscordPresence: (discordPresence) => set({ discordPresence }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setAudioQuality: (audioQuality) => set({ audioQuality }),
}));
