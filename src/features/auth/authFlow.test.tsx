import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./AuthProvider";
import RequireAuth from "./RequireAuth";
import LoginPage from "./pages/LoginPage";

function renderAuthRoutes(initialPath: string) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <h1>Trang chủ</h1> },
      { path: "/login", element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [{ path: "/checkout", element: <h1>Trang thanh toán</h1> }],
      },
    ],
    { initialEntries: [initialPath] },
  );

  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );

  return router;
}

beforeEach(() => localStorage.removeItem("parkpass-token"));
afterEach(() => localStorage.removeItem("parkpass-token"));

describe("auth flow", () => {
  it("redirects an anonymous visitor to login and preserves the target URL", async () => {
    const router = renderAuthRoutes("/checkout?step=1#summary");

    expect(
      await screen.findByRole("heading", { name: "Đăng nhập" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(
      new URLSearchParams(router.state.location.search).get("redirect"),
    ).toBe("/checkout?step=1#summary");
  });

  it("restores a saved token before showing the protected route", async () => {
    localStorage.setItem(
      "parkpass-token",
      JSON.stringify("parkpass-demo-token"),
    );
    const router = renderAuthRoutes("/checkout");

    expect(screen.getByRole("status")).toHaveTextContent(
      "Đang kiểm tra đăng nhập",
    );
    expect(
      await screen.findByRole("heading", { name: "Trang thanh toán" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/checkout");
  });

  it("returns to checkout after a successful login", async () => {
    const user = userEvent.setup();
    const router = renderAuthRoutes("/checkout");

    await user.type(screen.getByLabelText("Email"), "demo@parkpass.dev");
    await user.type(screen.getByLabelText("Mật khẩu"), "Passw0rd!");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(
      await screen.findByRole("heading", { name: "Trang thanh toán" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/checkout");
  });

  it("rejects an external redirect after login", async () => {
    const user = userEvent.setup();
    const router = renderAuthRoutes(
      "/login?redirect=https%3A%2F%2Fevil.example%2F",
    );

    await user.type(screen.getByLabelText("Email"), "demo@parkpass.dev");
    await user.type(screen.getByLabelText("Mật khẩu"), "Passw0rd!");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(
      await screen.findByRole("heading", { name: "Trang chủ" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });
});
