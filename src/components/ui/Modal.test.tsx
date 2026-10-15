import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import Modal from "./Modal";

function ModalHarness() {
  const [open, setOpen] = useState(false);
  const safeActionRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Mở modal
      </button>

      <Modal
        open={open}
        title="Xác nhận thao tác"
        description="Thao tác này không thể hoàn tác."
        initialFocusRef={safeActionRef}
        onClose={() => setOpen(false)}
      >
        <button ref={safeActionRef} type="button">
          Quay lại
        </button>
        <button type="button">Xác nhận</button>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("closes with Escape and returns focus to its trigger", async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    const trigger = screen.getByRole("button", { name: "Mở modal" });
    await user.click(trigger);

    expect(
      screen.getByRole("dialog", { name: "Xác nhận thao tác" }),
    ).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps keyboard focus inside the dialog", async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    await user.click(screen.getByRole("button", { name: "Mở modal" }));

    const dialog = screen.getByRole("dialog", {
      name: "Xác nhận thao tác",
    });
    const safeActionButton = within(dialog).getByRole("button", {
      name: "Quay lại",
    });
    const confirmButton = within(dialog).getByRole("button", {
      name: "Xác nhận",
    });

    expect(safeActionButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(safeActionButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    await user.click(screen.getByRole("button", { name: "Mở modal" }));
    await user.click(screen.getByRole("button", { name: "Đóng hộp thoại" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
