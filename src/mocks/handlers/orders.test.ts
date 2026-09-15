import { afterEach, expect, test, vi } from "vitest";
import type { Order } from "@/features/orders/types";
import { createValidOrderRequest, getVisitDate } from "@/test/orderFixtures";
import { mockOrdersKey } from "../orderStore";

const ordersUrl = "http://localhost/api/orders";
const authHeaders = { Authorization: "Bearer parkpass-demo-token" };

afterEach(() => vi.restoreAllMocks());

function postOrder(body: unknown = createValidOrderRequest()) {
  return fetch(ordersUrl, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function createOrder(
  body: unknown = createValidOrderRequest(),
): Promise<Order> {
  const response = await postOrder(body);
  expect(response.status).toBe(201);
  return response.json();
}

async function expectApiError(
  response: Response,
  status: number,
  code: string,
) {
  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toEqual(
    expect.objectContaining({ code, message: expect.any(String) }),
  );
}

test("creates a pending order with server-owned prices and identity", async () => {
  const body = createValidOrderRequest();
  const order = await createOrder(body);

  expect(order).toEqual({
    id: expect.any(String),
    userId: "user-demo",
    items: [
      {
        attractionId: "attraction-1",
        attractionName: "Attraction 1",
        ticketType: "ADULT",
        quantity: 1,
        unitPrice: 200_000,
      },
    ],
    visitDate: body.visitDate,
    subtotal: 200_000,
    discount: 0,
    total: 200_000,
    status: "PENDING",
    createdAt: expect.any(String),
  });
  expect(Number.isNaN(new Date(order.createdAt).getTime())).toBe(false);
});

test("ignores forged prices, names, totals, status and userId from the client", async () => {
  const order = await createOrder({
    ...createValidOrderRequest(),
    userId: "other-user",
    status: "PAID",
    subtotal: 1,
    discount: 1,
    total: 0,
    promoCode: " welcome10 ",
    items: [
      {
        attractionId: "attraction-1",
        ticketType: "ADULT",
        quantity: 2,
        unitPrice: 1,
        attractionName: "Forged",
      },
      {
        attractionId: "attraction-2",
        ticketType: "CHILD",
        quantity: 3,
        unitPrice: 0,
      },
    ],
  });

  expect(order).toEqual(
    expect.objectContaining({
      userId: "user-demo",
      status: "PENDING",
      promoCode: "WELCOME10",
      subtotal: 841_000,
      discount: 84_100,
      total: 756_900,
    }),
  );
  expect(order.items).toEqual([
    {
      attractionId: "attraction-1",
      attractionName: "Attraction 1",
      ticketType: "ADULT",
      quantity: 2,
      unitPrice: 200_000,
    },
    {
      attractionId: "attraction-2",
      attractionName: "Attraction 2",
      ticketType: "CHILD",
      quantity: 3,
      unitPrice: 147_000,
    },
  ]);
});

test.each([
  { promoCode: "WELCOME10", discount: 20_000 },
  { promoCode: "SUMMER15", discount: 30_000 },
  { promoCode: "FAMILY20", discount: 40_000 },
])("calculates the $promoCode discount", async ({ promoCode, discount }) => {
  const order = await createOrder(createValidOrderRequest({ promoCode }));
  expect(order.discount).toBe(discount);
  expect(order.total).toBe(200_000 - discount);
});

test.each([
  { method: "POST", path: "" },
  { method: "GET", path: "" },
  { method: "GET", path: "/not-found" },
  { method: "PATCH", path: "/not-found/cancel" },
])("requires auth for $method /api/orders$path", async ({ method, path }) => {
  for (const authorization of [
    undefined,
    "Bearer wrong-token",
    "Basic parkpass-demo-token",
  ]) {
    const response = await fetch(`${ordersUrl}${path}`, {
      method,
      headers: authorization ? { Authorization: authorization } : {},
      ...(method === "POST"
        ? { body: JSON.stringify(createValidOrderRequest()) }
        : {}),
    });
    await expectApiError(response, 401, "UNAUTHORIZED");
  }
  expect(localStorage.getItem(mockOrdersKey)).toBeNull();
});

test("returns all field errors without saving an invalid checkout", async () => {
  const response = await postOrder(
    createValidOrderRequest({
      fullName: " ",
      email: "invalid",
      phone: "123",
      visitDate: getVisitDate(-1),
      promoCode: "UNKNOWN",
      acceptTerms: false,
      items: [],
    }),
  );

  expect(response.status).toBe(422);
  await expect(response.json()).resolves.toEqual({
    code: "VALIDATION_ERROR",
    message: expect.any(String),
    fieldErrors: {
      fullName: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
      visitDate: expect.any(String),
      promoCode: expect.any(String),
      acceptTerms: expect.any(String),
      items: expect.any(String),
    },
  });
  expect(localStorage.getItem(mockOrdersKey)).toBeNull();
});

test.each([null, [], "invalid body", 42])(
  "returns 422 for an invalid order body: %j",
  async (body) => {
    await expectApiError(await postOrder(body), 422, "VALIDATION_ERROR");
    expect(localStorage.getItem(mockOrdersKey)).toBeNull();
  },
);

test.each(["", "not-json"])(
  "returns 422 for malformed JSON: %j",
  async (body) => {
    const response = await fetch(ordersUrl, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body,
    });
    await expectApiError(response, 422, "VALIDATION_ERROR");
  },
);

test("returns an empty history before any order exists", async () => {
  const response = await fetch(ordersUrl, { headers: authHeaders });
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual([]);
});

test("persists orders across a fresh module load and returns their details", async () => {
  const order = await createOrder();
  expect(JSON.parse(localStorage.getItem(mockOrdersKey) ?? "null")).toEqual([
    order,
  ]);

  vi.resetModules();
  const reloadedStore = await import("../orderStore");
  expect(reloadedStore.readOrders()).toEqual([order]);

  const response = await fetch(`${ordersUrl}/${order.id}`, {
    headers: authHeaders,
  });
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(order);
});

test("only lists orders belonging to the authenticated user", async () => {
  const order = await createOrder();
  const other: Order = { ...order, id: "other-order", userId: "other-user" };
  localStorage.setItem(mockOrdersKey, JSON.stringify([order, other]));

  const response = await fetch(ordersUrl, { headers: authHeaders });
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual([order]);
});

test.each([
  { method: "GET", suffix: "" },
  { method: "PATCH", suffix: "/cancel" },
])(
  "returns 404 for missing or another user's order on $method",
  async ({ method, suffix }) => {
    const order = await createOrder();
    const other: Order = { ...order, id: "other-order", userId: "other-user" };
    localStorage.setItem(mockOrdersKey, JSON.stringify([order, other]));

    for (const id of ["not-found", other.id]) {
      const response = await fetch(`${ordersUrl}/${id}${suffix}`, {
        method,
        headers: authHeaders,
      });
      await expectApiError(response, 404, "ORDER_NOT_FOUND");
    }
    expect(JSON.parse(localStorage.getItem(mockOrdersKey) ?? "null")).toEqual([
      order,
      other,
    ]);
  },
);

test("cancels and persists only the selected pending order", async () => {
  const first = await createOrder();
  const second = await createOrder();
  const other: Order = { ...first, id: "other-order", userId: "other-user" };
  localStorage.setItem(mockOrdersKey, JSON.stringify([first, second, other]));

  const response = await fetch(`${ordersUrl}/${first.id}/cancel`, {
    method: "PATCH",
    headers: authHeaders,
  });
  expect(response.status).toBe(200);
  const cancelled = { ...first, status: "CANCELLED" };
  await expect(response.json()).resolves.toEqual(cancelled);
  expect(JSON.parse(localStorage.getItem(mockOrdersKey) ?? "null")).toEqual([
    cancelled,
    second,
    other,
  ]);

  const detail = await fetch(`${ordersUrl}/${first.id}`, {
    headers: authHeaders,
  });
  await expect(detail.json()).resolves.toEqual(cancelled);
});

test.each(["PAID", "CANCELLED"] as const)(
  "returns 409 without changing a %s order",
  async (status) => {
    const created = await createOrder();
    const order: Order = { ...created, status };
    localStorage.setItem(mockOrdersKey, JSON.stringify([order]));

    const response = await fetch(`${ordersUrl}/${order.id}/cancel`, {
      method: "PATCH",
      headers: authHeaders,
    });
    await expectApiError(response, 409, "ORDER_NOT_PENDING");
    expect(JSON.parse(localStorage.getItem(mockOrdersKey) ?? "null")).toEqual([
      order,
    ]);
  },
);

test("returns 409 when cancelling the same order twice", async () => {
  const order = await createOrder();
  const url = `${ordersUrl}/${order.id}/cancel`;
  expect(
    (await fetch(url, { method: "PATCH", headers: authHeaders })).status,
  ).toBe(200);
  await expectApiError(
    await fetch(url, { method: "PATCH", headers: authHeaders }),
    409,
    "ORDER_NOT_PENDING",
  );
});

test.each(["not-json", "{}", "[{}]"])(
  "reports invalid stored orders without overwriting them: %j",
  async (raw) => {
    localStorage.setItem(mockOrdersKey, raw);
    await expectApiError(
      await fetch(ordersUrl, { headers: authHeaders }),
      500,
      "MOCK_STORAGE_ERROR",
    );
    await expectApiError(await postOrder(), 500, "MOCK_STORAGE_ERROR");
    expect(localStorage.getItem(mockOrdersKey)).toBe(raw);
  },
);

test("does not return success if localStorage cannot save a new order", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Storage quota exceeded", "QuotaExceededError");
  });
  await expectApiError(await postOrder(), 500, "MOCK_STORAGE_ERROR");
  expect(localStorage.getItem(mockOrdersKey)).toBeNull();
});

test("does not cancel an order if localStorage cannot save the change", async () => {
  const order = await createOrder();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Storage quota exceeded", "QuotaExceededError");
  });
  await expectApiError(
    await fetch(`${ordersUrl}/${order.id}/cancel`, {
      method: "PATCH",
      headers: authHeaders,
    }),
    500,
    "MOCK_STORAGE_ERROR",
  );
  expect(JSON.parse(localStorage.getItem(mockOrdersKey) ?? "null")).toEqual([
    order,
  ]);
});

test("returns ApiError when reading localStorage throws", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("Storage is blocked", "SecurityError");
  });
  await expectApiError(
    await fetch(ordersUrl, { headers: authHeaders }),
    500,
    "MOCK_STORAGE_ERROR",
  );
});

test("prices an attraction from the large dataset when enabled", async () => {
  localStorage.setItem("pp:large", "1");
  const order = await createOrder(
    createValidOrderRequest({
      items: [
        { attractionId: "attraction-500", ticketType: "ADULT", quantity: 1 },
      ],
    }),
  );
  expect(order.items[0]?.attractionName).toBe("Attraction 500");
  expect(order.items[0]?.unitPrice).toBe(5_190_000);
  expect(order.total).toBe(5_190_000);
});
