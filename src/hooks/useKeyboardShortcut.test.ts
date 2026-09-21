import { fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKeyboardShortcut } from "./useKeyboardShortcut";

describe("useKeyboardShortcut", () => {
  it("calls the handler when the configured key is pressed", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("/", handler));

    fireEvent.keyDown(window, { key: "/" });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
  });

  it("ignores other keys", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("/", handler));

    fireEvent.keyDown(window, { key: "Enter" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("removes the keyboard listener when the component unmounts", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut("/", handler));

    unmount();
    fireEvent.keyDown(window, { key: "/" });

    expect(handler).not.toHaveBeenCalled();
  });
});
