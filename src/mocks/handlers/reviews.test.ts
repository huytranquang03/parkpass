import { afterEach, expect, test, vi } from "vitest";

afterEach(() => vi.restoreAllMocks());

test("returns reviews for an existing attraction at the 20-percent boundary", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0.2);
  const response = await fetch(
    "http://localhost/api/attractions/attraction-1/reviews",
  );
  expect(response.status).toBe(200);
  const reviews = await response.json();
  expect(reviews).toHaveLength(3);
  for (const review of reviews) {
    expect(review).toEqual({
      id: expect.any(String),
      attractionId: "attraction-1",
      author: expect.any(String),
      rating: expect.any(Number),
      comment: expect.any(String),
      createdAt: expect.any(String),
    });
    expect(review.rating).toBeGreaterThanOrEqual(0);
    expect(review.rating).toBeLessThanOrEqual(5);
    expect(Number.isNaN(new Date(review.createdAt).getTime())).toBe(false);
  }
});

test("returns an ApiError within the 20-percent review failure range", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0.199999);
  const response = await fetch(
    "http://localhost/api/attractions/attraction-1/reviews",
  );
  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toEqual({
    code: "REVIEWS_ERROR",
    message: "Unable to load reviews",
  });
});

test("returns 404 for a missing attraction before random review errors", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  const response = await fetch(
    "http://localhost/api/attractions/missing/reviews",
  );
  expect(response.status).toBe(404);
  await expect(response.json()).resolves.toEqual({
    code: "ATTRACTION_NOT_FOUND",
    message: "Attraction not found",
  });
});

test("also returns reviews for large-dataset attractions", async () => {
  localStorage.setItem("pp:large", "1");
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  const response = await fetch(
    "http://localhost/api/attractions/attraction-500/reviews",
  );
  expect(response.status).toBe(200);
  const reviews = await response.json();
  expect(reviews).toHaveLength(3);
  expect(
    reviews.every(
      (review: { attractionId: string }) =>
        review.attractionId === "attraction-500",
    ),
  ).toBe(true);
});
