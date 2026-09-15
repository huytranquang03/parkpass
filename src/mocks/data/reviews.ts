import type { Review } from "@/features/reviews/types";

export function getReviews(attractionId: string): Review[] {
  return [
    {
      id: `${attractionId}-review-1`,
      attractionId,
      author: "Minh",
      rating: 5,
      comment: "A fun experience for the whole family.",
      createdAt: "2026-01-10T09:00:00.000Z",
    },
    {
      id: `${attractionId}-review-2`,
      attractionId,
      author: "Linh",
      rating: 4,
      comment: "Enjoyed the visit and would come back.",
      createdAt: "2026-01-12T10:00:00.000Z",
    },
    {
      id: `${attractionId}-review-3`,
      attractionId,
      author: "An",
      rating: 3,
      comment: "Nice attraction, but the queue was quite long.",
      createdAt: "2026-01-15T11:00:00.000Z",
    },
  ];
}
