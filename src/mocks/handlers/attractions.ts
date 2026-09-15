import { http, HttpResponse } from "msw";
import { getAttractions } from "../data/attractions";
import type { ApiError } from "@/lib/apiError";
import type { Attraction } from "@/features/attractions/types";
import { mockRequest } from "../mockBehavior";

function getLowestPrice(attraction: Attraction): number {
  return Math.min(
    attraction.prices.ADULT,
    attraction.prices.CHILD,
    attraction.prices.SENIOR,
  );
}

export const attractionHandlers = [
  http.get("*/api/attractions", async ({ request }) => {
    const failure = await mockRequest();
    if (failure) return failure;
    const attractions = getAttractions();
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const searchedAttractions =
      q === ""
        ? attractions
        : attractions.filter((attraction) =>
            attraction.name.toLowerCase().includes(q),
          );

    const parkId = (url.searchParams.get("park") ?? "").trim();
    const parkFilteredAttractions =
      parkId === ""
        ? searchedAttractions
        : searchedAttractions.filter(
            (attraction) => attraction.parkId === parkId,
          );

    const categories = url.searchParams.getAll("category");
    const filteredAttractions =
      categories.length === 0
        ? parkFilteredAttractions
        : parkFilteredAttractions.filter((attraction) =>
            categories.includes(attraction.category),
          );

    const sort = url.searchParams.get("sort") ?? "";
    const sortedAttractions = [...filteredAttractions];
    if (sort === "rating_desc") {
      sortedAttractions.sort((a, b) => b.rating - a.rating);
    } else if (sort === "price_asc") {
      sortedAttractions.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    } else if (sort === "price_desc") {
      sortedAttractions.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
    }

    const rawPage = Number(url.searchParams.get("page"));
    const rawLimit = Number(url.searchParams.get("limit"));
    let page;
    let limit;

    if (Number.isSafeInteger(rawPage) && rawPage > 0) {
      page = rawPage;
    } else {
      page = 1;
    }

    if (Number.isSafeInteger(rawLimit) && rawLimit > 0) {
      limit = Math.min(rawLimit, 500);
    } else {
      limit = 12;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = sortedAttractions.slice(startIndex, endIndex);
    return HttpResponse.json({
      data,
      total: filteredAttractions.length,
      page,
      limit,
    });
  }),

  http.get("*/api/attractions/:id", async ({ params }) => {
    const failure = await mockRequest();
    if (failure) return failure;
    const id = params.id;
    const attraction = getAttractions().find((item) => item.id === id);
    if (attraction === undefined) {
      return HttpResponse.json<ApiError>(
        {
          code: "ATTRACTION_NOT_FOUND",
          message: "Attraction not found",
        },
        {
          status: 404,
        },
      );
    }
    return HttpResponse.json(attraction);
  }),
];
