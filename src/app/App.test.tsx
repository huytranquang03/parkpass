import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { CartProvider } from "@/features/cart/CartProvider";
import { ThemeContext } from "@/features/theme/themeContext";
import AppLayout from "./AppLayout";

describe("app shell", () => {
  it("renders the shared layout and current route", () => {
    const router = createMemoryRouter(
      [
        {
          element: (
            <CartProvider>
              <ThemeContext.Provider
                value={{ theme: "light", toggleTheme: () => {} }}
              >
                <AppLayout />
              </ThemeContext.Provider>
            </CartProvider>
          ),
          children: [
            {
              path: "/",
              element: <h1>Danh sách trải nghiệm</h1>,
            },
          ],
        },
      ],
      { initialEntries: ["/"] },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Danh sách trải nghiệm",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ParkPass" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("button", { name: /mở giỏ hàng, hiện có 0 vé/i }),
    ).toBeInTheDocument();
  });
});
