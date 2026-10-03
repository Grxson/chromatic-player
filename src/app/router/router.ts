import type { ViewKey } from "@/components/layout/Sidebar";

export type Route =
  | { type: "view"; view: ViewKey }
  | { type: "album"; id: string }
  | { type: "artist"; id: string }
  | { type: "fullscreen" };

export const HOME_ROUTE: Route = { type: "view", view: "home" };

export function isViewKey(value: string): value is ViewKey {
  return value === "home" || value === "search" || value === "library" || value === "settings";
}
