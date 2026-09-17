import { Link } from "react-router";
import type { Attraction } from "../types";
import styles from "./AttractionCard.module.css";

interface AttractionCardProps {
  attraction: Attraction;
  parkName: string;
}

export default function AttractionCard({
  attraction,
  parkName,
}: AttractionCardProps) {
  const lowestPrice = Math.min(
    attraction.prices.ADULT,
    attraction.prices.CHILD,
    attraction.prices.SENIOR,
  );
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(lowestPrice);
  return (
    <article className={styles.card}>
      <img
        className={styles.image}
        src={attraction.images[0]}
        alt={attraction.name}
      />
      <p>{attraction.category}</p>
      <h2>
        <Link to={`/attractions/${attraction.id}`}>{attraction.name}</Link>
      </h2>
      <p>{parkName}</p>
      <p className={styles.price}>Từ {formattedPrice}</p>
      <p>Đánh giá: {attraction.rating}/5</p>
    </article>
  );
}
