import styles from "./StatusBadge.module.css";

type Status = "PENDING" | "PAID" | "CANCELLED";

interface StatusBadgeProps {
  status: Status;
}

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Chờ thanh toán",
    className: styles.pending!,
  },
  PAID: {
    label: "Đã thanh toán",
    className: styles.paid!,
  },
  CANCELLED: {
    label: "Đã hủy",
    className: styles.cancelled!,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`${styles.badge} ${config.className}`}>
      {config.label}
    </span>
  );
}
