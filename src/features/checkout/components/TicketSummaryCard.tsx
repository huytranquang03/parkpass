import type { TicketType } from "@/features/attractions/types";
import type { CartItem } from "@/features/cart/types";
import styles from "./TicketSummaryCard.module.css";

interface TicketSummaryCardProps {
  items: CartItem[];
  totalPrice: number;
}

const labels: Record<TicketType, string> = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  SENIOR: "Người cao tuổi",
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function TicketSummaryCard({
  items,
  totalPrice,
}: TicketSummaryCardProps) {
  return (
    <aside className={styles.card}>
      <h2>Vé đã chọn</h2>
      <ul>
        {items.map((item) => (
          <li
            key={`${item.attractionId}-${item.ticketType}`}
            className={styles.item}
          >
            <span>
              {item.attractionName} - {labels[item.ticketType]}
              {" x "}
              {item.quantity}
            </span>
            <strong>
              {currencyFormatter.format(item.price * item.quantity)}
            </strong>
          </li>
        ))}
      </ul>
      <p className={styles.total}>
        Tạm tính: {currencyFormatter.format(totalPrice)}
      </p>
    </aside>
  );
}
