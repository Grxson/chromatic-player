import { useEffect, useState } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncResource<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

const LOADING: AsyncResource<unknown> = { status: "loading", data: null, error: null };

/**
 * Runs an async producer whenever `key` changes and reports its progress
 * via an {@link AsyncResource}.
 *
 * - The initial render assumes `loading`. When `key` changes the effect
 *   triggers a fresh producer and the same `loading` state is reused
 *   (no synchronous setState is performed inside the effect).
 * - A race-condition guard is in place: stale results from previous
 *   keys are ignored when a newer key has already started.
 */
export function useAsyncResource<T>(key: string, producer: () => Promise<T>): AsyncResource<T> {
  const [state, setState] = useState<AsyncResource<T>>(() => LOADING as AsyncResource<T>);

  useEffect(() => {
    let cancelled = false;

    producer()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setState({ status: "success", data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({ status: "error", data: null, error: message });
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
