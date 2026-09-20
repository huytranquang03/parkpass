import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "test:use-local-storage";

afterEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});

describe("useLocalStorage", () => {
  it("uses and persists the initial value when storage is empty", () => {
    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, { count: 1 }),
    );

    expect(result.current[0]).toEqual({ count: 1 });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual({
      count: 1,
    });
  });

  it("reads an existing value from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 4 }));

    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, { count: 1 }),
    );

    expect(result.current[0]).toEqual({ count: 4 });
  });

  it("updates React state and localStorage together", () => {
    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, { count: 1 }),
    );

    act(() => {
      result.current[1]({ count: 7 });
    });

    expect(result.current[0]).toEqual({ count: 7 });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual({
      count: 7,
    });
  });

  it("falls back to the initial value when stored JSON is invalid", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json");

    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, { count: 1 }),
    );

    expect(result.current[0]).toEqual({ count: 1 });
  });
});
