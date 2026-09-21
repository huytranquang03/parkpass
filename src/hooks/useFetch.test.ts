import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "./useFetch";

interface TestData {
  message: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFetch", () => {
  it("returns data after a successful request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: "loaded" }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFetch<TestData>("/api/example"));

    expect(result.current.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(result.current.data).toEqual({ message: "loaded" });
    expect(result.current.error).toBeNull();
    expect(result.current.responseStatus).toBe(200);
  });

  it("returns an error for a non-successful response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 500)));

    const { result } = renderHook(() => useFetch<TestData>("/api/example"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Request failed with status 500");
    expect(result.current.responseStatus).toBe(500);
  });

  it("starts a new request when refetch is called", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: "loaded" }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFetch<TestData>("/api/example"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it("aborts the previous request when the URL changes", async () => {
    const signals: AbortSignal[] = [];
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      const signal = init?.signal;

      if (signal) {
        signals.push(signal);
      }

      return new Promise<Response>(() => undefined);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = renderHook(
      ({ url }: { url: string }) => useFetch<TestData>(url),
      { initialProps: { url: "/api/first" } },
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    rerender({ url: "/api/second" });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
  });
});
