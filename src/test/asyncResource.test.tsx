import { act, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useAsyncResource } from "@/hooks/useAsyncResource";

interface ResourceProps {
  resourceKey: string;
  producer: () => Promise<string>;
}

function Resource({ resourceKey, producer }: ResourceProps) {
  const resource = useAsyncResource<string>(resourceKey, producer);
  return (
    <div>
      <span data-testid="status">{resource.status}</span>
      <span data-testid="data">{resource.data ?? ""}</span>
      <span data-testid="error">{resource.error ?? ""}</span>
    </div>
  );
}

interface HarnessProps {
  first: () => Promise<string>;
  second: () => Promise<string>;
}

function Harness({ first, second }: HarnessProps) {
  const [resourceKey, setKey] = useState("first");
  return (
    <div>
      <button type="button" onClick={() => setKey("second")}>
        switch
      </button>
      <Resource resourceKey={resourceKey} producer={resourceKey === "first" ? first : second} />
    </div>
  );
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useAsyncResource", () => {
  it("starts in loading state", () => {
    const producer = () => Promise.resolve("value");
    const { getByTestId } = render(<Resource resourceKey="k" producer={producer} />);
    expect(getByTestId("status").textContent).toBe("loading");
    expect(getByTestId("data").textContent).toBe("");
  });

  it("transitions to success when the producer resolves", async () => {
    const producer = () => Promise.resolve("ready");
    const { getByTestId } = render(<Resource resourceKey="k" producer={producer} />);
    await waitFor(() => {
      expect(getByTestId("status").textContent).toBe("success");
    });
    expect(getByTestId("data").textContent).toBe("ready");
  });

  it("transitions to error when the producer rejects", async () => {
    const producer = () => Promise.reject(new Error("nope"));
    const { getByTestId } = render(<Resource resourceKey="k" producer={producer} />);
    await waitFor(() => {
      expect(getByTestId("status").textContent).toBe("error");
    });
    expect(getByTestId("error").textContent).toBe("nope");
  });

  it("resets to loading when the key changes", async () => {
    let firstResolve: (value: string) => void = () => undefined;
    const first = () =>
      new Promise<string>((resolve) => {
        firstResolve = resolve;
      });
    const second = () => Promise.resolve("second-value");

    const { getByTestId } = render(<Harness first={first} second={second} />);

    await waitFor(() => {
      expect(getByTestId("status").textContent).toBe("loading");
    });

    // Switch keys before the first producer resolves.
    act(() => {
      const button = document.querySelector("button");
      if (!button) {
        throw new Error("Missing button");
      }
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Even if the first producer resolves later, the UI must reflect
    // the new (loading, then success(second-value)) state.
    firstResolve("first-value");

    await waitFor(() => {
      expect(getByTestId("status").textContent).toBe("success");
    });
    expect(getByTestId("data").textContent).toBe("second-value");
  });
});
