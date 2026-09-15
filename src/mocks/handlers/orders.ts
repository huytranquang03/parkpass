import { http, HttpResponse, type PathParams } from "msw";
import type { CreateOrderRequest, Order } from "@/features/orders/types";
import type { ApiError } from "@/lib/apiError";
import { getAuthenticatedUser, unauthorizedResponse } from "../mockAuth";
import { mockRequest } from "../mockBehavior";
import { readOrders, writeOrders } from "../orderStore";
import { validateOrderRequest } from "../orderValidation";

function orderNotFoundResponse() {
  return HttpResponse.json<ApiError>(
    { code: "ORDER_NOT_FOUND", message: "Order not found" },
    { status: 404 },
  );
}

function storageErrorResponse() {
  return HttpResponse.json<ApiError>(
    {
      code: "MOCK_STORAGE_ERROR",
      message: "Unable to read or save mock orders",
    },
    { status: 500 },
  );
}

export const orderHandlers = [
  http.post<PathParams, CreateOrderRequest, Order | ApiError>(
    "*/api/orders",
    async ({ request }) => {
      const failure = await mockRequest();
      if (failure) return failure;
      const user = getAuthenticatedUser(request);
      if (!user) return unauthorizedResponse();

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        body = undefined;
      }

      const validation = validateOrderRequest(body);
      if (!validation.success) {
        return HttpResponse.json<ApiError>(
          {
            code: "VALIDATION_ERROR",
            message: "Please check your checkout details",
            fieldErrors: validation.fieldErrors,
          },
          { status: 422 },
        );
      }

      try {
        const orders = readOrders();
        const order: Order = {
          ...validation.data,
          id: crypto.randomUUID(),
          userId: user.id,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        };
        writeOrders([...orders, order]);
        return HttpResponse.json<Order>(order, { status: 201 });
      } catch {
        return storageErrorResponse();
      }
    },
  ),
  http.get<PathParams, never, Order[] | ApiError>(
    "*/api/orders",
    async ({ request }) => {
      const failure = await mockRequest();
      if (failure) return failure;
      const user = getAuthenticatedUser(request);
      if (!user) return unauthorizedResponse();

      try {
        return HttpResponse.json(
          readOrders().filter((order) => order.userId === user.id),
        );
      } catch {
        return storageErrorResponse();
      }
    },
  ),
  http.get<{ id: string }, never, Order | ApiError>(
    "*/api/orders/:id",
    async ({ request, params }) => {
      const failure = await mockRequest();
      if (failure) return failure;
      const user = getAuthenticatedUser(request);
      if (!user) return unauthorizedResponse();

      try {
        const order = readOrders().find(
          (entry) => entry.id === params.id && entry.userId === user.id,
        );
        return order ? HttpResponse.json(order) : orderNotFoundResponse();
      } catch {
        return storageErrorResponse();
      }
    },
  ),
  http.patch<{ id: string }, never, Order | ApiError>(
    "*/api/orders/:id/cancel",
    async ({ request, params }) => {
      const failure = await mockRequest();
      if (failure) return failure;
      const user = getAuthenticatedUser(request);
      if (!user) return unauthorizedResponse();

      try {
        const orders = readOrders();
        const order = orders.find(
          (entry) => entry.id === params.id && entry.userId === user.id,
        );
        if (!order) return orderNotFoundResponse();
        if (order.status !== "PENDING") {
          return HttpResponse.json<ApiError>(
            {
              code: "ORDER_NOT_PENDING",
              message: "Only pending orders can be cancelled",
            },
            { status: 409 },
          );
        }

        const cancelled: Order = { ...order, status: "CANCELLED" };
        writeOrders(
          orders.map((entry) => (entry === order ? cancelled : entry)),
        );
        return HttpResponse.json<Order>(cancelled);
      } catch {
        return storageErrorResponse();
      }
    },
  ),
];
