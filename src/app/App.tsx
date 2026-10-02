import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import { CartProvider } from "@/features/cart/CartProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function App() {
  return (
    <ErrorBoundary fallbackMessage="Ứng dụng gặp lỗi. Vui lòng thử lại.">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CartProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </CartProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
