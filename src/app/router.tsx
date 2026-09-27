import { createBrowserRouter } from "react-router";
import AttractionListPage from "@/features/attractions/pages/AttractionListPage";
import AttractionDetailPage from "@/features/attractions/pages/AttractionDetailPage";
import AppLayout from "./AppLayout";
import NotFoundPage from "./NotFoundPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RequireAuth from "@/features/auth/RequireAuth";
import RouteErrorPage from "./RouteErrorPage";

import { CheckoutPage, OrderDetailPage, OrdersPage } from "./LazyPages";
import { Suspense } from "react";
import RouteLoadingFallback from "./RouteLoadingFallback";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
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
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <RequireAuth />
          </Suspense>
        ),
        children: [
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/orders", element: <OrdersPage /> },
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
