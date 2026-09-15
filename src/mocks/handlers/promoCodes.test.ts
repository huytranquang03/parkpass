import { expect, test } from "vitest";

test.each([
  { code: "WELCOME10", discountPercent: 10 },
  { code: "SUMMER15", discountPercent: 15 },
  { code: "FAMILY20", discountPercent: 20 },
])("returns promo code $code", async ({ code, discountPercent }) => {
  const response = await fetch(`http://localhost/api/promo-codes/${code}`);

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ code, discountPercent });
});

test("returns 404 when the promo code does not exist", async () => {
  const response = await fetch("http://localhost/api/promo-codes/UNKNOWN");

  expect(response.status).toBe(404);
  await expect(response.json()).resolves.toEqual(
    expect.objectContaining({
      code: "PROMO_CODE_NOT_FOUND",
      message: expect.any(String),
    }),
  );
});

test("normalizes promo codes like the order validation does", async () => {
  const response = await fetch(
    "http://localhost/api/promo-codes/%20welcome10%20",
  );
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    code: "WELCOME10",
    discountPercent: 10,
  });
});
