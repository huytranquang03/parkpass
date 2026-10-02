import { queryOptions } from "@tanstack/react-query";
import { getReviews } from "./api";

export const reviewKeys = {
  all: ["reviews"] as const,

  byAttraction: (attractionId: string) =>
    [...reviewKeys.all, "attraction", attractionId] as const,
};

export function reviewsOptions(attractionId: string) {
  return queryOptions({
    queryKey: reviewKeys.byAttraction(attractionId),

    queryFn: ({ signal }) => getReviews(attractionId, signal),

    staleTime: 60_000,

    retry: false,
  });
}
