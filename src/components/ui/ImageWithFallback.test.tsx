import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ImageWithFallback from "./ImageWithFallback";

describe("ImageWithFallback", () => {
  it("shows a labelled placeholder when an image cannot load", () => {
    const handleError = vi.fn();

    render(
      <ImageWithFallback
        src="/broken-image.jpg"
        alt="Attraction 1"
        onError={handleError}
      />,
    );

    fireEvent.error(screen.getByAltText("Attraction 1"));

    expect(handleError).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("img", {
        name: "Không tải được ảnh Attraction 1",
      }),
    ).toBeInTheDocument();
  });

  it("tries to render again when the source changes", () => {
    const { rerender } = render(
      <ImageWithFallback src="/broken-image.jpg" alt="Attraction 1" />,
    );

    fireEvent.error(screen.getByAltText("Attraction 1"));

    rerender(<ImageWithFallback src="/new-image.jpg" alt="Attraction 1" />);

    expect(screen.getByAltText("Attraction 1")).toHaveAttribute(
      "src",
      "/new-image.jpg",
    );
  });
});
