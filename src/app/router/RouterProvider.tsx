import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { HOME_ROUTE, type Route } from "./router";
import { RouterContext } from "./useRouter";

export interface RouterProviderProps {
  children: ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash));

  const navigate = useCallback((next: Route) => {
    window.history.pushState(null, "", routeToHash(next));
    setRoute(next);
  }, []);

  useEffect(() => {
    const syncRoute = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);

  const value = useMemo(() => ({ route, navigate }), [route, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function routeFromHash(hash: string): Route {
  const normalized = hash.startsWith("#/") ? hash.slice(2) : hash.replace(/^#/, "");
  const [type, rawValue] = normalized.split("/");
  const value = rawValue ? decodeRoutePart(rawValue) : "";
  if (type === "album" && value) return { type: "album", id: value };
  if (type === "artist" && value) return { type: "artist", id: value };
  if (type === "playlist" && value) return { type: "playlist", id: value };
  if (type === "fullscreen") return { type: "fullscreen" };
  if (type === "view" && ["home", "search", "library", "settings"].includes(value)) {
    return { type: "view", view: value as "home" | "search" | "library" | "settings" };
  }
  return HOME_ROUTE;
}

function routeToHash(route: Route): string {
  if (route.type === "view") return `#/view/${route.view}`;
  if (route.type === "fullscreen") return "#/fullscreen";
  return `#/${route.type}/${encodeURIComponent(route.id)}`;
}

function decodeRoutePart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}
