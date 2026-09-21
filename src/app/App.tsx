import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import { CartProvider } from "@/features/cart/CartProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </ThemeProvider>
  );
}
