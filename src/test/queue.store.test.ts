import { afterEach, describe, expect, it, vi } from "vitest";
import { useQueueStore } from "@/stores/queue.store";
import type { Track } from "@/domain/entities";
import { mockTracks } from "@/mocks";

function resetQueue() {
  useQueueStore.setState({ tracks: [], currentIndex: -1 });
}

function track(id: string): Track {
  const found = mockTracks.find((t) => t.id === id);
  if (!found) {
    throw new Error(`Missing track ${id}`);
  }
  return found;
}

afterEach(() => {
  resetQueue();
});

describe("QueueStore", () => {
  it("starts empty", () => {
    resetQueue();
    const state = useQueueStore.getState();
    expect(state.tracks).toEqual([]);
    expect(state.currentIndex).toBe(-1);
    expect(state.getCurrentTrack()).toBeNull();
    expect(state.hasNext()).toBe(false);
    expect(state.hasPrevious()).toBe(false);
  });

  it("enqueue replaces and resets cursor", () => {
    useQueueStore.getState().enqueue([track("track-slow-light"), track("track-drift-theory")]);
    expect(useQueueStore.getState().currentIndex).toBe(0);
    expect(useQueueStore.getState().tracks).toHaveLength(2);
  });

  it("append keeps cursor untouched", () => {
    useQueueStore.getState().enqueue([track("track-slow-light")]);
    useQueueStore.getState().append(track("track-drift-theory"));
    expect(useQueueStore.getState().currentIndex).toBe(0);
    expect(useQueueStore.getState().tracks).toHaveLength(2);
  });

  it("removeAt adjusts cursor when removing before current", () => {
    useQueueStore
      .getState()
      .enqueue([
        track("track-slow-light"),
        track("track-drift-theory"),
        track("track-velvet-echo"),
      ]);
    useQueueStore.setState({ currentIndex: 2 });
    useQueueStore.getState().removeAt(0);
    const state = useQueueStore.getState();
    expect(state.currentIndex).toBe(1);
    expect(state.tracks.map((t) => t.id)).toEqual(["track-drift-theory", "track-velvet-echo"]);
  });

  it("removeAt adjusts cursor when removing current", () => {
    useQueueStore
      .getState()
      .enqueue([
        track("track-slow-light"),
        track("track-drift-theory"),
        track("track-velvet-echo"),
      ]);
    useQueueStore.setState({ currentIndex: 1 });
    useQueueStore.getState().removeAt(1);
    const state = useQueueStore.getState();
    expect(state.currentIndex).toBe(1);
    expect(state.tracks.map((t) => t.id)).toEqual(["track-slow-light", "track-velvet-echo"]);
  });

  it("removeAt clears cursor when removing the last track", () => {
    useQueueStore.getState().enqueue([track("track-slow-light")]);
    useQueueStore.getState().removeAt(0);
    const state = useQueueStore.getState();
    expect(state.tracks).toEqual([]);
    expect(state.currentIndex).toBe(-1);
    expect(state.getCurrentTrack()).toBeNull();
  });

  it("moveNext advances cursor and returns the next track", () => {
    useQueueStore
      .getState()
      .enqueue([
        track("track-slow-light"),
        track("track-drift-theory"),
        track("track-velvet-echo"),
      ]);
    useQueueStore.setState({ currentIndex: 0 });
    const next = useQueueStore.getState().moveNext();
    expect(useQueueStore.getState().currentIndex).toBe(1);
    expect(next?.id).toBe("track-drift-theory");
  });

  it("moveNext returns null at the end of the queue", () => {
    useQueueStore.getState().enqueue([track("track-slow-light")]);
    const result = useQueueStore.getState().moveNext();
    expect(result).toBeNull();
    expect(useQueueStore.getState().currentIndex).toBe(0);
  });

  it("movePrevious retreats the cursor and returns the previous track", () => {
    useQueueStore
      .getState()
      .enqueue([
        track("track-slow-light"),
        track("track-drift-theory"),
        track("track-velvet-echo"),
      ]);
    useQueueStore.setState({ currentIndex: 2 });
    const previous = useQueueStore.getState().movePrevious();
    expect(useQueueStore.getState().currentIndex).toBe(1);
    expect(previous?.id).toBe("track-drift-theory");
  });

  it("movePrevious returns null at the start of the queue", () => {
    useQueueStore.getState().enqueue([track("track-slow-light"), track("track-drift-theory")]);
    const result = useQueueStore.getState().movePrevious();
    expect(result).toBeNull();
    expect(useQueueStore.getState().currentIndex).toBe(0);
  });

  it("jumpTo moves the cursor and returns the track", () => {
    useQueueStore
      .getState()
      .enqueue([
        track("track-slow-light"),
        track("track-drift-theory"),
        track("track-velvet-echo"),
      ]);
    const jumped = useQueueStore.getState().jumpTo(2);
    expect(useQueueStore.getState().currentIndex).toBe(2);
    expect(jumped?.id).toBe("track-velvet-echo");
  });

  it("jumpTo returns null for an out-of-range index", () => {
    useQueueStore.getState().enqueue([track("track-slow-light")]);
    const result = useQueueStore.getState().jumpTo(5);
    expect(result).toBeNull();
    expect(useQueueStore.getState().currentIndex).toBe(0);
  });

  it("hasNext / hasPrevious reflect the cursor position", () => {
    useQueueStore
      .getState()
      .enqueue([
        track("track-slow-light"),
        track("track-drift-theory"),
        track("track-velvet-echo"),
      ]);
    expect(useQueueStore.getState().hasNext()).toBe(true);
    expect(useQueueStore.getState().hasPrevious()).toBe(false);
    useQueueStore.setState({ currentIndex: 1 });
    expect(useQueueStore.getState().hasNext()).toBe(true);
    expect(useQueueStore.getState().hasPrevious()).toBe(true);
    useQueueStore.setState({ currentIndex: 2 });
    expect(useQueueStore.getState().hasNext()).toBe(false);
  });

  it("clear empties the queue", () => {
    useQueueStore.getState().enqueue([track("track-slow-light"), track("track-drift-theory")]);
    useQueueStore.getState().clear();
    expect(useQueueStore.getState().tracks).toEqual([]);
    expect(useQueueStore.getState().currentIndex).toBe(-1);
  });

  it("calling enqueue twice replaces the previous one atomically", () => {
    useQueueStore.getState().enqueue([track("track-slow-light")]);
    useQueueStore.getState().enqueue([track("track-drift-theory"), track("track-velvet-echo")]);
    const state = useQueueStore.getState();
    expect(state.tracks.map((t) => t.id)).toEqual(["track-drift-theory", "track-velvet-echo"]);
    expect(state.currentIndex).toBe(0);
  });
});

vi.mock("@/components", () => ({}));
