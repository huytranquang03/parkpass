import { Link } from "react-router";
import type { Attraction } from "../types";
import styles from "./AttractionCard.module.css";
import Badge from "@/components/ui/Badge";
import { memo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { attractionDetailOptions } from "../queries";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const CATEGORY_LABELS: Record<Attraction["category"], string> = {
  THRILL: "Cảm giác mạnh",
  FAMILY: "Gia đình",
  KIDS: "Trẻ em",
  SHOW: "Biểu diễn",
  WATER: "Dưới nước",
};

interface AttractionCardProps {
  attraction: Attraction;
  parkName: string;
}

function AttractionCard({ attraction, parkName }: AttractionCardProps) {
  const queryClient = useQueryClient();

  const lowestPrice = Math.min(
    attraction.prices.ADULT,
    attraction.prices.CHILD,
    attraction.prices.SENIOR,
  );
  const formattedPrice = currencyFormatter.format(lowestPrice);

  function handlePrefetchDetail() {
    queryClient
      .query(attractionDetailOptions(attraction.id))
      .catch(() => undefined);
  }

  return (
    // <Card>
    //   <Card.Image src={attraction.images[0]} alt={attraction.name} />

    //   <Card.Body>
    //     <Badge>{attraction.category}</Badge>
    //     <h2>
    //       <Link
    //         to={`/attractions/${attraction.id}`}
    //         onMouseEnter={handlePrefetchDetail}
    //         onFocus={handlePrefetchDetail}
    //       >
    //         {attraction.name}
    //       </Link>
    //     </h2>
    //     <p>{parkName}</p>
    //   </Card.Body>

    //   <Card.Footer>
    //     <p className={styles.price}>Từ {formattedPrice}</p>
    //     <p>Đánh giá: {attraction.rating}/5</p>
    //   </Card.Footer>
    // </Card>

    <Link
      className={`${styles.card} ${styles.cardLink}`}
      to={`/attractions/${attraction.id}`}
      onMouseEnter={handlePrefetchDetail}
      onFocus={handlePrefetchDetail}
    >
      <div className={styles.media}>
        <ImageWithFallback
          className={styles.image}
          fallbackClassName={styles.imageFallback}
          src={attraction.images[0]}
          alt={attraction.name}
          loading="lazy"
        />

        <div className={styles.category}>
          <Badge>{CATEGORY_LABELS[attraction.category]}</Badge>
        </div>
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>{attraction.name}</h2>

        <p className={styles.parkName}>{parkName}</p>

        <div className={styles.meta}>
          <span
            className={styles.rating}
            aria-label={`Đánh giá ${attraction.rating} trên 5`}
          >
            <span className={styles.star} aria-hidden="true">
              ★
            </span>

            <span className={styles.ratingValue} aria-hidden="true">
              {attraction.rating.toFixed(1)}
            </span>
          </span>

          <span className={styles.price}>Từ {formattedPrice}</span>
        </div>
      </div>
    </Link>
  );
}

export default memo(AttractionCard);
