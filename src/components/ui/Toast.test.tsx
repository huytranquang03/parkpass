import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Toast from "./Toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("announces a success message and closes after four seconds", () => {
    const onClose = vi.fn();

    render(<Toast message="Đã thêm vé vào giỏ" onClose={onClose} />);

    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Đã thêm vé vào giỏ");
    expect(toast).toHaveAttribute("aria-live", "polite");

    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("pauses while hovered and resumes with the remaining time", () => {
    const onClose = vi.fn();

    render(<Toast message="Đã thêm vé vào giỏ" onClose={onClose} />);

    const toast = screen.getByRole("status");

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    fireEvent.mouseEnter(toast);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseLeave(toast);

    act(() => {
      vi.advanceTimersByTime(2499);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes immediately when the close button is clicked", () => {
    const onClose = vi.fn();

    render(<Toast message="Đã thêm vé vào giỏ" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Đóng thông báo" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("announces an error message as an alert", () => {
    render(
      <Toast
        message="Không hủy được đơn, vui lòng thử lại"
        variant="error"
        onClose={vi.fn()}
      />,
    );

    const toast = screen.getByRole("alert");
    expect(toast).toHaveTextContent("Không hủy được đơn, vui lòng thử lại");
    expect(toast).toHaveAttribute("aria-live", "assertive");
  });
});
