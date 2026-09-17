import { createBrowserRouter } from "react-router";
import AttractionListPage from "@/features/attractions/pages/AttractionListPage";
import NotFoundPage from "./NotFoundPage";
import AttractionDetailPage from "@/features/attractions/pages/AttractionDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AttractionListPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    path: "/attractions/:id",
    element: <AttractionDetailPage />,
  },
]);
