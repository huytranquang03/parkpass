import { Link } from "react-router";
import type { Attraction } from "../types";
import styles from "./AttractionCard.module.css";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { memo } from "react";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

interface AttractionCardProps {
  attraction: Attraction;
  parkName: string;
}

function AttractionCard({ attraction, parkName }: AttractionCardProps) {
  const lowestPrice = Math.min(
    attraction.prices.ADULT,
    attraction.prices.CHILD,
    attraction.prices.SENIOR,
  );
  const formattedPrice = currencyFormatter.format(lowestPrice);
  return (
    <Card>
      <Card.Image src={attraction.images[0]} alt={attraction.name} />

      <Card.Body>
        <Badge>{attraction.category}</Badge>
        <h2>
          <Link to={`/attractions/${attraction.id}`}>{attraction.name}</Link>
        </h2>
        <p>{parkName}</p>
      </Card.Body>

      <Card.Footer>
        <p className={styles.price}>Từ {formattedPrice}</p>
        <p>Đánh giá: {attraction.rating}/5</p>
      </Card.Footer>
    </Card>
  );
}

export default memo(AttractionCard);
