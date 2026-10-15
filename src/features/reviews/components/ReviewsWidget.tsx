import List from "@/components/ui/List";
import { reviewsOptions } from "../queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import styles from "./ReviewsWidget.module.css";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

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
    <div className={styles.widget}>
      <List
        items={reviews}
        renderEmpty={() => (
          <p className={styles.empty}>Chưa có đánh giá nào.</p>
        )}
        getKey={(review) => review.id}
        renderItem={(review) => (
          <article className={styles.review}>
            <div className={styles.reviewHeader}>
              <h3>{review.author}</h3>
              <span className={styles.reviewRating}>
                <span aria-hidden="true">★</span>
                {review.rating}/5
              </span>
            </div>
            <p>{review.comment}</p>
            <time dateTime={review.createdAt}>
              {dateFormatter.format(new Date(review.createdAt))}
            </time>
          </article>
        )}
      />
    </div>
  );
}
