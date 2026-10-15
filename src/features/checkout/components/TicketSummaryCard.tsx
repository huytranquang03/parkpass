import type { TicketType } from "@/features/attractions/types";
import type { CartItem } from "@/features/cart/types";
import styles from "./TicketSummaryCard.module.css";
import type { ReactNode } from "react";

interface TicketSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  discount?: number;
  isCheckingPromo?: boolean;
  action?: ReactNode;
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
  subtotal,
  discount = 0,
  isCheckingPromo = false,
  action,
}: TicketSummaryCardProps) {
  const total = Math.max(0, subtotal - discount);

  let discountContent = "Không áp dụng";

  if (isCheckingPromo) {
    discountContent = "Đang kiểm tra mã";
  } else if (discount > 0) {
    discountContent = `−${currencyFormatter.format(discount)}`;
  }

  return (
    <aside className={styles.card} aria-labelledby="ticket-summary-title">
      <h2 id="ticket-summary-title" className={styles.title}>
        Tóm tắt đơn
      </h2>

      <ul className={styles.itemList}>
        {items.map((item) => (
          <li
            key={`${item.attractionId}-${item.ticketType}`}
            className={styles.item}
          >
            <div className={styles.itemInformation}>
              <span className={styles.attractionName}>
                {item.attractionName}
              </span>

              <span>
                {labels[item.ticketType]} × {item.quantity}
              </span>
            </div>

            <strong className={styles.itemPrice}>
              {currencyFormatter.format(item.price * item.quantity)}
            </strong>
          </li>
        ))}
      </ul>

      <div className={styles.breakdown}>
        <div className={styles.row}>
          <span className={styles.label}>Tạm tính</span>

          <span className={styles.value}>
            {currencyFormatter.format(subtotal)}
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Giảm giá</span>

          <span className={styles.discountValue}>{discountContent}</span>
        </div>
      </div>

      <div className={styles.total}>
        <span className={styles.totalLabel}>Tổng</span>

        <strong className={styles.totalPrice}>
          {currencyFormatter.format(total)}
        </strong>
      </div>
      {action && (
        <div className={styles.actionArea}>
          {action}

          <p className={styles.termsNote}>
            Bằng việc đặt vé, bạn đồng ý với Điều khoản sử dụng của ParkPass.
          </p>
        </div>
      )}
    </aside>
  );
}
