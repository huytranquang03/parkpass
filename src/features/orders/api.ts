import { ApiRequestError, type ApiError } from "@/lib/apiError";
import type { CreateOrderRequest, Order } from "./types";

export async function createOrder(
  requestBody: CreateOrderRequest,
  token: string,
): Promise<Order> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const apiError = (await response.json()) as ApiError;
    throw new ApiRequestError(response.status, apiError);
  }
  return (await response.json()) as Order;
}

export async function getOrders(
  token: string,
  signal?: AbortSignal,
): Promise<Order[]> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    const apiError = (await response.json()) as ApiError;

    throw new ApiRequestError(response.status, apiError);
  }

  return (await response.json()) as Order[];
}

export async function getOrderDetail(
  orderId: string,
  token: string,
  signal?: AbortSignal,
): Promise<Order> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  );

  if (!response.ok) {
    const apiError = (await response.json()) as ApiError;

    throw new ApiRequestError(response.status, apiError);
  }

  return (await response.json()) as Order;
}

export async function cancelOrder(
  orderId: string,
  token: string,
): Promise<Order> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const apiError = (await response.json()) as ApiError;

    throw new ApiRequestError(response.status, apiError);
  }

  return (await response.json()) as Order;
}
