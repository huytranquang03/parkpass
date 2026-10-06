import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthContext } from "@/features/auth/authContext";
import { demoToken, demoUser } from "@/mocks/data/auth";
import { server } from "@/mocks/node";
import { useCartStore } from "@/features/cart/cartStore";
import type { ApiError } from "@/lib/apiError";
import { getVisitDate } from "@/test/orderFixtures";
import CheckoutPage from "./CheckoutPage";

const cartItem = {
  attractionId: "attraction-1",
  attractionName: "Roller Coaster",
  ticketType: "ADULT" as const,
  price: 150_000,
  quantity: 1,
};

function renderCheckoutPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: demoUser,
          token: demoToken,
          status: "authenticated",
          login: () => Promise.resolve(),
          logout: () => {},
        }}
      >
        <MemoryRouter initialEntries={["/checkout"]}>
          <Routes>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders/:id" element={<h1>Đặt vé thành công</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  promoCode = "",
) {
  await user.type(screen.getByLabelText("Họ và tên"), "Demo User");
  await user.type(screen.getByLabelText("Email"), "demo@parkpass.dev");
  await user.type(screen.getByLabelText("Số điện thoại"), "0901234567");

  fireEvent.change(screen.getByLabelText("Ngày tham quan"), {
    target: { value: getVisitDate() },
  });

  if (promoCode) {
    await user.type(
      screen.getByLabelText("Mã khuyến mãi (không bắt buộc)"),
      promoCode,
    );
  }

  await user.click(screen.getByLabelText("Tôi đồng ý với điều khoản"));
}

beforeEach(() => {
  useCartStore.setState({ items: [cartItem] });
});

describe("CheckoutPage", () => {
  it("shows client validation errors and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    renderCheckoutPage();

    await user.click(screen.getByRole("button", { name: "Xác nhận đặt vé" }));

    expect(await screen.findByText("Vui lòng nhập họ và tên")).toBeVisible();
    expect(screen.getByLabelText("Họ và tên")).toHaveFocus();
  });

  it("shows an async promo error and focuses the promo field", async () => {
    const user = userEvent.setup();
    renderCheckoutPage();
    await fillValidForm(user, "UNKNOWN");

    await user.click(screen.getByRole("button", { name: "Xác nhận đặt vé" }));

    expect(
      await screen.findByText("Mã khuyến mãi không tồn tại"),
    ).toBeVisible();
    expect(
      screen.getByLabelText("Mã khuyến mãi (không bắt buộc)"),
    ).toHaveFocus();
  });

  it("creates an order with a valid promo code and clears the cart", async () => {
    const user = userEvent.setup();
    renderCheckoutPage();
    await fillValidForm(user, "WELCOME10");

    await user.click(screen.getByRole("button", { name: "Xác nhận đặt vé" }));

    expect(
      await screen.findByRole("heading", { name: "Đặt vé thành công" }),
    ).toBeVisible();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("maps server 422 errors to fields and focuses the first server field", async () => {
    server.use(
      http.post("*/api/orders", () =>
        HttpResponse.json<ApiError>(
          {
            code: "VALIDATION_ERROR",
            message: "Please check your checkout details",
            fieldErrors: {
              email: "Email đã được sử dụng",
              phone: "Số điện thoại không được chấp nhận",
            },
          },
          { status: 422 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderCheckoutPage();
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Xác nhận đặt vé" }));

    expect(await screen.findByText("Email đã được sử dụng")).toBeVisible();
    expect(
      screen.getByText("Số điện thoại không được chấp nhận"),
    ).toBeVisible();

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toHaveFocus();
    });
  });
});
