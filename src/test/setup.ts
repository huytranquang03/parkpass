import { server } from "@/mocks/node";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

// Tests must not depend on the developer-only `.env.local` file.
// GitHub Actions starts from a clean checkout, so define the same API base URL
// used by the MSW handlers explicitly for every test worker.
vi.stubEnv("VITE_API_BASE_URL", "/api");

afterEach(() => {
  cleanup();
  // Mock flags/orders must not leak between tests. Keep unrelated keys untouched.
  for (const key of ["pp:chaos", "pp:large", "pp:orders", "parkpass-cart"]) {
    localStorage.removeItem(key);
  }
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});
