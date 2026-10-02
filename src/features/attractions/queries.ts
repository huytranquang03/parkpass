import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/apiError";
import { getAttractionDetail, getAttractions, getParks } from "./api";
import type { AttractionListFilters } from "./types";

export const attractionKeys = {
  all: ["attractions"] as const,

  lists: () => [...attractionKeys.all, "list"] as const,

  // details: () => [...attractionKeys.all, "detail"] as const,

  // detail: (id: string) => [...attractionKeys.details(), id] as const,

  list: (filters: AttractionListFilters) =>
    [...attractionKeys.lists(), filters] as const,

  detail: (id: string) => [...attractionKeys.all, "detail", id] as const,
};

export function attractionDetailOptions(id: string) {
  return queryOptions({
    queryKey: attractionKeys.detail(id),

    queryFn: ({ signal }) => getAttractionDetail(id, signal),

    staleTime: 60_000,

    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}

export function attractionListOptions(filters: AttractionListFilters) {
  return queryOptions({
    queryKey: attractionKeys.list(filters),

    queryFn: ({ signal }) => getAttractions(filters, signal),

    staleTime: 30_000,

    placeholderData: keepPreviousData,
  });
}

export const parkKeys = {
  all: ["parks"] as const,
};

export const parksOptions = queryOptions({
  queryKey: parkKeys.all,

  queryFn: ({ signal }) => getParks(signal),

  // staleTime: 5 * 60_000,
  staleTime: 300_000,
});
