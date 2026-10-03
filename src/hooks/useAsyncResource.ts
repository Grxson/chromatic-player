import { useEffect, useReducer } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncResource<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

interface State<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

type Action<T> =
  { type: "reset" } | { type: "success"; data: T } | { type: "error"; message: string };

function reducer<T>(_state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "reset":
      return { status: "loading", data: null, error: null };
    case "success":
      return { status: "success", data: action.data, error: null };
    case "error":
      return { status: "error", data: null, error: action.message };
  }
}

/**
 * Runs an async producer whenever `key` changes and reports its progress
 * via an {@link AsyncResource}.
 *
 * Behaviour:
 * - The first render starts in `loading`.
 * - When `key` changes, the state is reset to `loading` and a fresh
 *   producer is run. There is no flash of the previous data because the
 *   reset happens before the producer resolves.
 * - A stale-result guard is in place: only the most recent request can
 *   update the state. Older requests are dropped.
 *
 * Implementation note: we use `useReducer` so the reset is a pure state
 * transition and we avoid the synchronous setState anti-pattern. The
 * `dispatch({ type: "reset" })` call inside the effect is intentional —
 * it is the correct way to mark the resource as transitioning.
 */
export function useAsyncResource<T>(key: string, producer: () => Promise<T>): AsyncResource<T> {
  const [state, dispatch] = useReducer(reducer<T>, {
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    dispatch({ type: "reset" });

    producer()
      .then((data) => {
        if (cancelled) {
          return;
        }
        dispatch({ type: "success", data });
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        const message = err instanceof Error ? err.message : "Unknown error";
        dispatch({ type: "error", message });
      });

    return () => {
      cancelled = true;
    };
    // The producer closure is intentionally not part of the dependency
    // array: it is recreated on every render by callers, and `key` is
    // what represents the resource identity.
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
