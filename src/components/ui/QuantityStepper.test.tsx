import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import QuantityStepper from "./QuantityStepper";

function ControlledStepper({ initialValue = 0 }: { initialValue?: number }) {
  const [value, setValue] = useState(initialValue);

  return <QuantityStepper value={value} min={0} max={10} onChange={setValue} />;
}

describe("QuantityStepper", () => {
  it("updates a value through its controlled onChange prop", async () => {
    const user = userEvent.setup();
    render(<ControlledStepper initialValue={2} />);

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "−" }));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("disables decrement at the minimum value", () => {
    render(<ControlledStepper />);

    expect(screen.getByRole("button", { name: "−" })).toBeDisabled();
  });

  it("disables increment at the maximum value", () => {
    render(<ControlledStepper initialValue={10} />);

    expect(screen.getByRole("button", { name: "+" })).toBeDisabled();
  });
});
