import type { TicketType } from "@/features/attractions/types";
import type { CartItem } from "../types";
import styles from "./CartItemRow.module.css";
import QuantityStepper from "@/components/ui/QuantityStepper";

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

const TICKET_LABELS: Record<TicketType, string> = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  SENIOR: "Người cao tuổi",
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const subtotal = item.price * item.quantity;

  return (
    <article className={styles.item}>
      <div>
        <h3 className={styles.name}>{item.attractionName}</h3>
        <p className={styles.ticketType}>{TICKET_LABELS[item.ticketType]}</p>
        <p className={styles.price}>
          {currencyFormatter.format(item.price)} × {item.quantity}
        </p>
      </div>
      <div className={styles.actions}>
        <strong>{currencyFormatter.format(subtotal)}</strong>
        <QuantityStepper
          value={item.quantity}
          min={1}
          max={10}
          onChange={onQuantityChange}
        />
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
        >
          Xoá
        </button>
      </div>
    </article>
  );
}
