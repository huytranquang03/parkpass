import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import { CartProvider } from "@/features/cart/CartProvider";

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
