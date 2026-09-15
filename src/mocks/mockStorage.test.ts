import { afterEach, expect, test, vi } from "vitest";
import { isMockFlagEnabled } from "./mockStorage";

afterEach(() => vi.restoreAllMocks());

test.each(["pp:chaos", "pp:large"] as const)(
  "only enables %s when its value is 1",
  (key) => {
    expect(isMockFlagEnabled(key)).toBe(false);
    localStorage.setItem(key, "true");
    expect(isMockFlagEnabled(key)).toBe(false);
    localStorage.setItem(key, "1");
    expect(isMockFlagEnabled(key)).toBe(true);
  },
);

test("defaults flags to off if storage access is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("Storage is blocked", "SecurityError");
  });
  expect(isMockFlagEnabled("pp:chaos")).toBe(false);
  expect(isMockFlagEnabled("pp:large")).toBe(false);
});

test("defaults flags to off outside a browser storage environment", () => {
  vi.stubGlobal("localStorage", undefined);
  try {
    expect(isMockFlagEnabled("pp:large")).toBe(false);
  } finally {
    vi.unstubAllGlobals();
  }
});
