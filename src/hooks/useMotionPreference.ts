import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings.store";

/**
 * Effective motion preference for the application.
 *
 * Combines the OS-level `prefers-reduced-motion` setting with the
 * application-level `settings.animations` toggle. Either of them being
 * off disables Motion-based animations.
 */
export interface MotionPreference {
  /** True when Motion-based animations should run. */
  motionEnabled: boolean;
  /** True when the OS reports `prefers-reduced-motion: reduce`. */
  reducedMotionPreferred: boolean;
}

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Returns the current motion preference. Components can use
 * `motionEnabled` to opt out of Motion variants when the user prefers
 * reduced motion or has switched animations off in Settings.
 */
export function useMotionPreference(): MotionPreference {
  const settingsAnimations = useSettingsStore((state) => state.animations);
  const [reducedMotionPreferred, setReducedMotionPreferred] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(QUERY);
    const handler = (event: MediaQueryListEvent) => {
      setReducedMotionPreferred(event.matches);
    };
    mql.addEventListener("change", handler);
    // The lazy initializer already captured the current value; we only
    // need to react to changes from here on.
    return () => {
      mql.removeEventListener("change", handler);
    };
  }, []);

  return {
    motionEnabled: settingsAnimations && !reducedMotionPreferred,
    reducedMotionPreferred,
  };
}
