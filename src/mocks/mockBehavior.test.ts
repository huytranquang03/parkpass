import { afterEach, expect, test, vi } from "vitest";
import { createValidOrderRequest } from "@/test/orderFixtures";

afterEach(() => vi.restoreAllMocks());

const endpoints = [
  { method: "GET", path: "/api/attractions" },
  { method: "GET", path: "/api/attractions/attraction-1" },
  { method: "GET", path: "/api/attractions/attraction-1/reviews" },
  { method: "GET", path: "/api/parks" },
  { method: "POST", path: "/api/auth/login" },
  { method: "GET", path: "/api/me" },
  { method: "GET", path: "/api/promo-codes/WELCOME10" },
  { method: "POST", path: "/api/orders" },
  { method: "GET", path: "/api/orders" },
  { method: "GET", path: "/api/orders/not-found" },
  { method: "PATCH", path: "/api/orders/not-found/cancel" },
];

test.each(endpoints)(
  "chaos mode can fail $method $path",
  async ({ method, path }) => {
    localStorage.setItem("pp:chaos", "1");
    vi.spyOn(Math, "random").mockReturnValue(0.299999);

    const response = await fetch(`http://localhost${path}`, {
      method,
      headers: {
        Authorization: "Bearer parkpass-demo-token",
        "Content-Type": "application/json",
      },
      ...(method === "POST"
        ? { body: JSON.stringify(createValidOrderRequest()) }
        : {}),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: "CHAOS_ERROR",
      message: "Simulated server error",
    });
    expect(localStorage.getItem("pp:orders")).toBeNull();
  },
);

test("does not fail at the 30-percent chaos boundary", async () => {
  localStorage.setItem("pp:chaos", "1");
  vi.spyOn(Math, "random").mockReturnValue(0.3);
  expect((await fetch("http://localhost/api/parks")).status).toBe(200);
});

test("does not inject chaos errors when the flag is off", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  expect((await fetch("http://localhost/api/parks")).status).toBe(200);
});

test("turns chaos mode off without restarting the server", async () => {
  localStorage.setItem("pp:chaos", "1");
  vi.spyOn(Math, "random").mockReturnValue(0);
  expect((await fetch("http://localhost/api/parks")).status).toBe(500);
  localStorage.removeItem("pp:chaos");
  expect((await fetch("http://localhost/api/parks")).status).toBe(200);
});
