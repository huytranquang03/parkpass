import { test, expect } from "vitest";

test("returns the park list", async () => {
  const response = await fetch("http://localhost/api/parks");

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual([
    {
      id: "park-1",
      name: "Adventure Park",
      city: "Ho Chi Minh City",
    },
  ]);
});
