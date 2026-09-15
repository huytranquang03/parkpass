export function isMockFlagEnabled(key: "pp:chaos" | "pp:large"): boolean {
  try {
    return globalThis.localStorage?.getItem(key) === "1";
  } catch {
    // Read-only mock modes still work when browser storage is unavailable.
    return false;
  }
}
