import { createBrowserRouter } from "react-router";
import AttractionListPage from "@/features/attractions/pages/AttractionListPage";
import AttractionDetailPage from "@/features/attractions/pages/AttractionDetailPage";
import AppLayout from "./AppLayout";
import NotFoundPage from "./NotFoundPage";
import CheckoutPage from "@/features/checkout/pages/CheckoutPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RequireAuth from "@/features/auth/RequireAuth";
import OrderPage from "@/features/orders/pages/OrdersPage";
import OrderDetailPage from "@/features/orders/pages/OrderDetailPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <AttractionListPage />,
      },
      {
        path: "/attractions/:id",
        element: <AttractionDetailPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
      {
        element: <RequireAuth />,
        children: [
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/orders", element: <OrderPage /> },
          {
            path: "/orders/:id",
            element: <OrderDetailPage />,
          },
        ],
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
]);
