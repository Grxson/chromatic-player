import { createContext, useContext } from "react";
import type { Route } from "./router";

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
}

export const RouterContext = createContext<RouterContextValue | null>(null);

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error("useRouter must be used inside <RouterProvider>");
  }
  return ctx;
}
