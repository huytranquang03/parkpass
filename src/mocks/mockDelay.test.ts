import { afterEach, expect, test, vi } from "vitest";
import { mockDelay } from "./mockDelay";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

test("skips latency in test mode", async () => {
  vi.useFakeTimers();
  vi.stubEnv("MODE", "test");
  const random = vi.spyOn(Math, "random");

  await mockDelay();

  expect(random).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

test.each([
  { label: "minimum", random: 0, duration: 300 },
  { label: "maximum", random: 0.999999, duration: 1200 },
])(
  "waits for the $label latency before resolving",
  async ({ random, duration }) => {
    vi.useFakeTimers();
    vi.stubEnv("MODE", "development");
    vi.spyOn(Math, "random").mockReturnValue(random);

    let completed = false;
    const pending = mockDelay().then(() => {
      completed = true;
    });

    await vi.advanceTimersByTimeAsync(duration - 1);
    expect(completed).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(completed).toBe(true);
  },
);
