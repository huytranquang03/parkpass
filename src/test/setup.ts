import { server } from "@/mocks/node";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

afterEach(() => {
  cleanup();
  // Mock flags/orders must not leak between tests. Keep unrelated keys untouched.
  for (const key of ["pp:chaos", "pp:large", "pp:orders", "parkpass-cart"]) {
    localStorage.removeItem(key);
  }
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
