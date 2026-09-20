import { createBrowserRouter } from "react-router";
import AttractionListPage from "@/features/attractions/pages/AttractionListPage";
import AttractionDetailPage from "@/features/attractions/pages/AttractionDetailPage";
import AppLayout from "./AppLayout";
import NotFoundPage from "./NotFoundPage";

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
    ],
  },
]);
