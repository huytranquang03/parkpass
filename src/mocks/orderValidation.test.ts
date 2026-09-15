import { expect, test } from "vitest";
import { createValidOrderRequest } from "@/test/orderFixtures";
import { getVisitDateError, validateOrderRequest } from "./orderValidation";

const now = new Date(2026, 8, 15, 12);
const validBody = () => createValidOrderRequest({ visitDate: "2026-09-16" });

test.each(["2026-09-15", "2026-09-16", "2026-12-14"])(
  "accepts visit date %s within the inclusive 90-day window",
  (date) => {
    expect(getVisitDateError(date, now)).toBeUndefined();
  },
);

test.each([
  undefined,
  null,
  "",
  "2026-9-16",
  "2026-09-31",
  "2026-02-29",
  "2026-09-14",
  "2026-12-15",
  "2026-09-16T00:00:00Z",
])("rejects an invalid or out-of-range visit date: %j", (date) => {
  expect(getVisitDateError(date, now)).toEqual(expect.any(String));
});

test("accepts a real leap day in the visit window", () => {
  expect(
    getVisitDateError("2028-02-29", new Date(2028, 1, 1, 12)),
  ).toBeUndefined();
});

test.each([
  "0901234567",
  "+84901234567",
  "090 123 4567",
  "090-123-4567",
  "02412345678",
  "+842812345678",
])("accepts phone number %s", (phone) => {
  expect(validateOrderRequest({ ...validBody(), phone }, now).success).toBe(
    true,
  );
});

test.each([
  { field: "fullName", value: undefined },
  { field: "fullName", value: 42 },
  { field: "email", value: undefined },
  { field: "email", value: "user@" },
  { field: "phone", value: 901234567 },
  { field: "phone", value: "+10901234567" },
  { field: "acceptTerms", value: "true" },
  { field: "items", value: {} },
])("rejects an invalid $field value: $value", ({ field, value }) => {
  const result = validateOrderRequest({ ...validBody(), [field]: value }, now);
  expect(result.success).toBe(false);
  if (!result.success)
    expect(result.fieldErrors[field]).toEqual(expect.any(String));
});

test.each([
  {
    label: "unknown attraction",
    item: { attractionId: "missing", ticketType: "ADULT", quantity: 1 },
  },
  {
    label: "unknown ticket type",
    item: { attractionId: "attraction-1", ticketType: "VIP", quantity: 1 },
  },
  ...[0, -1, 11, 1.5, "1", null, Number.NaN, Number.POSITIVE_INFINITY].map(
    (quantity) => ({
      label: `invalid quantity ${String(quantity)}`,
      item: { attractionId: "attraction-1", ticketType: "ADULT", quantity },
    }),
  ),
  { label: "null item", item: null },
])("rejects $label with an items error", ({ item }) => {
  const result = validateOrderRequest({ ...validBody(), items: [item] }, now);
  expect(result.success).toBe(false);
  if (!result.success)
    expect(result.fieldErrors.items).toEqual(expect.any(String));
});

test("rejects duplicate attraction/ticket lines", () => {
  const body = validBody();
  const result = validateOrderRequest(
    { ...body, items: [...body.items, ...body.items] },
    now,
  );
  expect(result.success).toBe(false);
  if (!result.success)
    expect(result.fieldErrors.items).toEqual(expect.any(String));
});

test.each(["ADULT", "CHILD", "SENIOR"] as const)(
  "uses the seed price for %s tickets",
  (ticketType) => {
    const prices = { ADULT: 200_000, CHILD: 140_000, SENIOR: 160_000 };
    const result = validateOrderRequest(
      {
        ...validBody(),
        items: [
          {
            attractionId: "attraction-1",
            ticketType,
            quantity: 10,
            unitPrice: 0,
          },
        ],
      },
      now,
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.total).toBe(prices[ticketType] * 10);
  },
);

test.each(["", "   "])(
  "allows an empty optional promo code: %j",
  (promoCode) => {
    const result = validateOrderRequest({ ...validBody(), promoCode }, now);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discount).toBe(0);
      expect(result.data).not.toHaveProperty("promoCode");
    }
  },
);

test.each(["UNKNOWN", null, 10])(
  "returns a promoCode error for %j",
  (promoCode) => {
    const result = validateOrderRequest({ ...validBody(), promoCode }, now);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.fieldErrors.promoCode).toEqual(expect.any(String));
  },
);
