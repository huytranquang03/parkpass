import type { TicketType } from "@/features/attractions/types";
import type { CartItem } from "../types";
import styles from "./CartItemRow.module.css";
import QuantityStepper from "@/components/ui/QuantityStepper";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

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

  // return (
  //   <article className={styles.item}>
  //     <div>
  //       <h3 className={styles.name}>{item.attractionName}</h3>
  //       <p className={styles.ticketType}>{TICKET_LABELS[item.ticketType]}</p>
  //       <p className={styles.price}>
  //         {currencyFormatter.format(item.price)} × {item.quantity}
  //       </p>
  //     </div>
  //     <div className={styles.actions}>
  //       <strong>{currencyFormatter.format(subtotal)}</strong>
  //       <QuantityStepper
  //         value={item.quantity}
  //         min={1}
  //         max={10}
  //         onChange={onQuantityChange}
  //       />
  //       <button
  //         type="button"
  //         className={styles.removeButton}
  //         onClick={onRemove}
  //       >
  //         Xoá
  //       </button>
  //     </div>
  //   </article>
  // );

  return (
    <article className={styles.item}>
      <div className={styles.information}>
        <ImageWithFallback
          className={styles.thumbnail}
          fallbackClassName={styles.thumbnailFallback}
          src={item.imageUrl}
          alt={item.attractionName}
          loading="lazy"
        />

        <div className={styles.details}>
          <h3 className={styles.name}>{item.attractionName}</h3>

          <p className={styles.ticketInformation}>
            {TICKET_LABELS[item.ticketType]} ·{" "}
            {currencyFormatter.format(item.price)}/vé
          </p>
        </div>

        <button
          type="button"
          className={styles.removeButton}
          aria-label={`Xóa vé ${TICKET_LABELS[item.ticketType]} của ${item.attractionName}`}
          onClick={onRemove}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="m19 6-1 14H6L5 6" />
          </svg>
        </button>
      </div>

      <div className={styles.controls}>
        <QuantityStepper
          value={item.quantity}
          min={1}
          max={10}
          onChange={onQuantityChange}
        />

        <strong className={styles.subtotal}>
          {currencyFormatter.format(subtotal)}
        </strong>
      </div>
    </article>
  );
}
