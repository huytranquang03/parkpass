import { http, HttpResponse } from "msw";
import type { ApiError } from "@/lib/apiError";
import { getAttractions } from "../data/attractions";
import { getReviews } from "../data/reviews";
import { mockRequest } from "../mockBehavior";

export const reviewHandlers = [
  http.get("*/api/attractions/:id/reviews", async ({ params }) => {
    const failure = await mockRequest();
    if (failure) return failure;

    const attraction = getAttractions().find((item) => item.id === params.id);
    if (!attraction) {
      return HttpResponse.json<ApiError>(
        { code: "ATTRACTION_NOT_FOUND", message: "Attraction not found" },
        { status: 404 },
      );
    }

    if (Math.random() < 0.2) {
      return HttpResponse.json<ApiError>(
        { code: "REVIEWS_ERROR", message: "Unable to load reviews" },
        { status: 500 },
      );
    }

    return HttpResponse.json(getReviews(attraction.id));
  }),
];
