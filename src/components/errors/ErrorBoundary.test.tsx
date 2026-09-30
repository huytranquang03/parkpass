import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe("ErrorBoundary", () => {
  it("renders its fallback when a child throws", () => {
    function BrokenWidget(): never {
      throw new Error("Widget failed");
    }

    render(
      <ErrorBoundary fallbackMessage="Không thể tải widget">
        <BrokenWidget />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: "Đã xảy ra lỗi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Không thể tải widget")).toBeInTheDocument();
  });

  it("tries to render its children again after reset", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function RecoverableWidget() {
      if (shouldThrow) {
        throw new Error("Temporary failure");
      }

      return <p>Widget đã hoạt động</p>;
    }

    render(
      <ErrorBoundary>
        <RecoverableWidget />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Thử lại" }));

    expect(screen.getByText("Widget đã hoạt động")).toBeInTheDocument();
  });
});
