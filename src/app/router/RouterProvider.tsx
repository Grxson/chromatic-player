import { type ReactNode, useMemo, useState } from "react";
import { HOME_ROUTE, type Route } from "./router";
import { RouterContext } from "./useRouter";

export interface RouterProviderProps {
  children: ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  const [route, setRoute] = useState<Route>(HOME_ROUTE);

  const value = useMemo(
    () => ({
      route,
      navigate: setRoute,
    }),
    [route],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
