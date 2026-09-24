import { useAuth } from "@/features/auth/authContext";
import { useFetch } from "@/hooks/useFetch";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import type { Order, OrderItem } from "../types";
import Badge from "@/components/ui/Badge";
import styles from "./OrderDetailPage.module.css";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { ApiError } from "@/lib/apiError";

interface OrderDetailLocationState {
  successMessage?: string;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const STATUS_LABELS: Record<Order["status"], string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã huỷ",
};

const TICKET_LABELS: Record<OrderItem["ticketType"], string> = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  SENIOR: "Người cao tuổi",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const location = useLocation();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const state = location.state as OrderDetailLocationState | null;
  const [toastMessage, setToastMessage] = useState(
    state?.successMessage ?? null,
  );

  const requestInit = useMemo<RequestInit | undefined>(() => {
    if (!token) return undefined;

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const {
    status,
    data: order,
    error,
    responseStatus,
    refetch,
  } = useFetch<Order>(
    `${import.meta.env.VITE_API_BASE_URL}/orders/${id ?? "__missing__"}`,
    requestInit,
  );

  async function handleCancelOrder() {
    if (!token || !order || isCancelling) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${order.id}/cancel`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) {
        const apiError = (await response.json()) as ApiError;
        throw new Error(apiError.message);
      }
      setIsCancelModalOpen(false);
      refetch();
    } catch (error) {
      if (error instanceof Error) {
        setCancelError(error.message);
      } else {
        setCancelError("Không thể hủy đơn hàng");
      }
    } finally {
      setIsCancelling(false);
    }
  }

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);

  if (status === "loading") {
    return <p role="status">Đang tải chi tiết đơn hàng...</p>;
  }

  if (status === "error" && responseStatus === 404) {
    return (
      <section>
        <h1>Không tìm thấy đơn hàng</h1>
        <Link to="/orders">Quay lại danh sách đơn hàng</Link>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section>
        <p role="alert">{error ?? "Không thể tải đơn hàng"}</p>
        <button type="button" onClick={refetch}>
          Thử lại
        </button>
      </section>
    );
  }

  if (!order) return null;
  return (
    <>
      <section className={styles.page}>
        <Link to="/orders">← Quay lại danh sách</Link>
        <div className={styles.header}>
          <h1>Chi tiết đơn hàng</h1>
          <Badge>{STATUS_LABELS[order.status]}</Badge>
        </div>
        <p>Mã đơn: {order.id}</p>
        <p>Ngày tham quan: {order.visitDate}</p>
        <h2>Vé đã đặt</h2>
        <ul className={styles.ticketList}>
          {order.items.map((item) => (
            <li
              key={`${item.attractionId}-${item.ticketType}`}
              className={styles.ticketItem}
            >
              <strong>{item.attractionName}</strong>
              <p>
                {TICKET_LABELS[item.ticketType]} × {item.quantity}
              </p>
              <p>{currencyFormatter.format(item.unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className={styles.summary}>
          <p>Tạm tính: {currencyFormatter.format(order.subtotal)}</p>
          <p>Giảm giá: {currencyFormatter.format(order.discount)}</p>
          <p className={styles.total}>
            <strong>Tổng cộng: {currencyFormatter.format(order.total)}</strong>
          </p>
          {order.status === "PENDING" && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCancelModalOpen(true);
                setCancelError(null);
              }}
            >
              Huỷ đơn hàng
            </Button>
          )}
        </div>
      </section>

      <Modal
        open={isCancelModalOpen}
        title="Xác nhận huỷ đơn"
        onClose={() => setIsCancelModalOpen(false)}
      >
        <p>Bạn có chắc muốn huỷ đơn hàng này không?</p>

        {cancelError && <p role="alert">{cancelError}</p>}

        <Button
          type="button"
          onClick={() => void handleCancelOrder()}
          disabled={isCancelling}
        >
          {isCancelling ? "Đang huỷ..." : "Xác nhận huỷ"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsCancelModalOpen(false)}
          disabled={isCancelling}
        >
          Không, quay lại
        </Button>
      </Modal>

      {toastMessage && (
        <p className={styles.toast} role="status">
          {toastMessage}
        </p>
      )}
    </>
  );
}
