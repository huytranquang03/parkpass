import { useAuth } from "@/features/auth/authContext";
import type { Order } from "../types";
import { useMemo } from "react";
import { useFetch } from "@/hooks/useFetch";
import { Link } from "react-router";
import Badge from "@/components/ui/Badge";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const STATUS_LABELS: Record<Order["status"], string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
};

export default function OrdersPage() {
  const { token } = useAuth();
  const requestInit = useMemo<RequestInit | undefined>(() => {
    if (!token) return undefined;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const { status, data, error, refetch } = useFetch<Order[]>(
    `${import.meta.env.VITE_API_BASE_URL}/orders`,
    requestInit,
  );

  const orders = data ?? [];

  if (status === "loading") {
    return <p role="status">Đang tải đơn hàng...</p>;
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

  if (orders.length === 0) {
    return (
      <section>
        <h1>Đơn hàng của tôi</h1>
        <p>Bạn chưa có đơn hàng nào.</p>
        <Link to="/">Khám phá trải nghiệm</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Đơn hàng của tôi</h1>

      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <div>
              <strong>Mã đơn: {order.id}</strong>
              <Badge>{STATUS_LABELS[order.status]}</Badge>
            </div>
            <p>Ngày tham quan: {order.visitDate}</p>
            <p>Tổng tiền: {currencyFormatter.format(order.total)}</p>
            <Link to={`/orders/${order.id}`}>Xem chi tiết</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
