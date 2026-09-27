import { lazy } from "react";

export const CheckoutPage = lazy(
  () => import("@/features/checkout/pages/CheckoutPage"),
);

export const OrdersPage = lazy(
  () => import("@/features/orders/pages/OrdersPage"),
);

export const OrderDetailPage = lazy(
  () => import("@/features/orders/pages/OrderDetailPage"),
);
