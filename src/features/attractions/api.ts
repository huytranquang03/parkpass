import { ApiRequestError, type ApiError } from "@/lib/apiError";
import type {
  Attraction,
  AttractionListFilters,
  AttractionListResponse,
  Park,
} from "./types";

export async function getAttractionDetail(
  id: string,
  signal?: AbortSignal,
): Promise<Attraction> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/attractions/${id}`,
    { signal },
  );

  if (!response.ok) {
    const apiError = (await response.json()) as ApiError;

    throw new ApiRequestError(response.status, apiError);
  }

  return (await response.json()) as Attraction;
}
// queryFn: (context) => {
//   return getAttractionDetail(id, context.signal);
// };

export async function getAttractions(
  filters: AttractionListFilters,
  signal?: AbortSignal,
): Promise<AttractionListResponse> {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.park) {
    params.set("park", filters.park);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  filters.categories.forEach((category) => {
    params.append("category", category);
  });

  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/attractions?${params.toString()}`,
    { signal },
  );

  if (!response.ok) {
    const apiError = (await response.json()) as ApiError;

    throw new ApiRequestError(response.status, apiError);
  }

  return (await response.json()) as AttractionListResponse;
}

export async function getParks(signal?: AbortSignal): Promise<Park[]> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parks`, {
    signal,
  });

  if (!response.ok) {
    const apiError = (await response.json()) as ApiError;

    throw new ApiRequestError(response.status, apiError);
  }

  return (await response.json()) as Park[];
}
