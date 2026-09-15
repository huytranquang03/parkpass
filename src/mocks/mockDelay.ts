import { delay } from "msw";

export async function mockDelay(): Promise<void> {
  // Keep automated tests fast and deterministic.
  if (import.meta.env.MODE === "test") {
    return;
  }

  const duration = 300 + Math.floor(Math.random() * 901);
  await delay(duration);
}
