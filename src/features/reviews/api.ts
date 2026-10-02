import { ApiRequestError, type ApiError } from "@/lib/apiError";
import type { Review } from "./types";

export async function getReviews(
  attractionId: string,
  signal?: AbortSignal,
): Promise<Review[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/attractions/${attractionId}/reviews`,
    { signal },
  );

  if (!response.ok) {
    const apiError = (await response.json()) as ApiError;

    throw new ApiRequestError(response.status, apiError);
  }

  return (await response.json()) as Review[];
}
