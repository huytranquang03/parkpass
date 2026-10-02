import List from "@/components/ui/List";
import { reviewsOptions } from "../queries";
import { useSuspenseQuery } from "@tanstack/react-query";

interface ReviewsWidgetProps {
  attractionId: string;
}

export default function ReviewsWidget({ attractionId }: ReviewsWidgetProps) {
  // const { status, data, error } = useFetch<Review[]>(
  //   `${import.meta.env.VITE_API_BASE_URL}/attractions/${attractionId}/reviews`,
  // );

  // if (status === "loading") {
  //   return <p role="status">Đang tải đánh giá...</p>;
  // }

  // if (status === "error") {
  //   throw new Error(error ?? "Không thể tải đánh giá");
  // }

  // const reviews = data ?? [];

  const { data: reviews } = useSuspenseQuery(reviewsOptions(attractionId));

  return (
    <section>
      <h2>Đánh giá</h2>

      <List
        items={reviews}
        renderEmpty={() => <p>Chưa có đánh giá nào.</p>}
        getKey={(review) => review.id}
        renderItem={(review) => (
          <>
            <strong>{review.author}</strong>
            <p>Đánh giá: {review.rating}/5</p>
            <p>{review.comment}</p>
          </>
        )}
      ></List>
    </section>
  );
}
