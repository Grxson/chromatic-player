import { create } from "zustand";

export type AudioQuality = "LOW" | "HIGH" | "LOSSLESS" | "MAX";

export type ThemeMode = "dark";

/**
 * User preferences that are independent of the current playback session.
 *
 * Note: `volume` is intentionally NOT here. The current volume is owned
 * by `PlayerStore` because it describes the live player state, not a
 * persistent preference. If we later need a "default volume at startup"
 * we will introduce a separate `defaultVolume` field with that exact
 * meaning.
 */
export interface SettingsState {
  theme: ThemeMode;
  animations: boolean;
  discordPresence: boolean;
  sidebarCollapsed: boolean;
  audioQuality: AudioQuality;

  setAnimations: (enabled: boolean) => void;
  setDiscordPresence: (enabled: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAudioQuality: (quality: AudioQuality) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "dark",
  animations: true,
  discordPresence: false,
  sidebarCollapsed: false,
  audioQuality: "MAX",

  setAnimations: (animations) => set({ animations }),
  setDiscordPresence: (discordPresence) => set({ discordPresence }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setAudioQuality: (audioQuality) => set({ audioQuality }),
}));
