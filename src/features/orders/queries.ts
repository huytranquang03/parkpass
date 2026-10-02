import { queryOptions } from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/apiError";
import { getOrderDetail, getOrders } from "./api";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  // details: () => [...orderKeys.all, "detail"] as const,
  // detail: (orderId: string) => [...orderKeys.details(), orderId] as const,
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
};

export function ordersOptions(token: string | null) {
  return queryOptions({
    queryKey: orderKeys.lists(),

    queryFn: ({ signal }) => {
      if (!token) {
        throw new Error("Phiên đăng nhập không hợp lệ");
      }

      return getOrders(token, signal);
    },

    enabled: token !== null,

    staleTime: 30_000,
  });
}

export function orderDetailOptions(orderId: string, token: string | null) {
  return queryOptions({
    queryKey: orderKeys.detail(orderId),

    queryFn: ({ signal }) => {
      if (!token) {
        throw new Error("Phiên đăng nhập không hợp lệ");
      }

      return getOrderDetail(orderId, token, signal);
    },

    enabled: token !== null,

    staleTime: 30_000,

    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
