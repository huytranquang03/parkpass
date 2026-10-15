import { useAuth } from "@/features/auth/authContext";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ordersOptions } from "../queries";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./OrdersPage.module.css";
import type { Order } from "../types";
import { useState } from "react";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN");

function getOrderSummary(order: Order) {
  const attractionName =
    order.items[0]?.attractionName ?? "Không có thông tin trải nghiệm";

  const ticketCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return `${attractionName} · ${ticketCount} vé`;
}

type OrderFilter = "ALL" | Order["status"];

const ORDER_FILTERS: Array<{
  value: OrderFilter;
  label: string;
}> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELLED", label: "Đã hủy" },
];

// const STATUS_LABELS: Record<Order["status"], string> = {
//   PENDING: "Chờ thanh toán",
//   PAID: "Đã thanh toán",
//   CANCELLED: "Đã hủy",
// };

export default function OrdersPage() {
  const { token } = useAuth();

  // const requestInit = useMemo<RequestInit | undefined>(() => {
  //   if (!token) return undefined;
  //   return {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   };
  // }, [token]);

  // const { status, data, error, refetch } = useFetch<Order[]>(
  //   `${import.meta.env.VITE_API_BASE_URL}/orders`,
  //   requestInit,
  // );

  // const orders = data ?? [];

  const {
    data: orders = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery(ordersOptions(token));

  const [activeFilter, setActiveFilter] = useState<OrderFilter>("ALL");

  const filteredOrders =
    activeFilter === "ALL"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  function getOrderCount(filter: OrderFilter) {
    if (filter === "ALL") {
      return orders.length;
    }

    return orders.filter((order) => order.status === filter).length;
  }

  if (isPending) {
    return (
      <section className={styles.page} aria-busy="true">
        <h1 className={styles.title}>Đơn hàng của tôi</h1>

        <p className={styles.visuallyHidden} role="status">
          Đang tải đơn hàng...
        </p>

        <ul className={styles.orderList} aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <li className={styles.orderItem} key={index}>
              <div className={styles.orderRow}>
                <div className={styles.orderIdentity}>
                  <Skeleton className={styles.skeletonId} />
                  <Skeleton className={styles.skeletonDate} />
                </div>

                <Skeleton className={styles.skeletonSummary} />
                <Skeleton className={styles.skeletonBadge} />
                <Skeleton className={styles.skeletonTotal} />
                <Skeleton className={styles.skeletonChevron} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Đơn hàng của tôi</h1>

        <div className={styles.statePanel}>
          <ErrorState
            title="Không thể tải đơn hàng"
            description={error.message || "Vui lòng thử lại sau."}
            action={<Button onClick={() => refetch()}>Thử lại</Button>}
          />
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Đơn hàng của tôi</h1>

        <div className={styles.statePanel}>
          <EmptyState
            title="Bạn chưa có đơn hàng"
            description="Hãy chọn một trải nghiệm và đặt vé để bắt đầu."
            action={
              <Link className={styles.primaryLink} to="/">
                Khám phá trải nghiệm
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  // return (
  //   <section>
  //     <h1>Đơn hàng của tôi</h1>

  //     <ul>
  //       {orders.map((order) => (
  //         <li key={order.id}>
  //           <div>
  //             <strong>Mã đơn: {order.id}</strong>
  //             {/* <Badge>{STATUS_LABELS[order.status]}</Badge> */}
  //             <StatusBadge status={order.status} />
  //           </div>
  //           <p>Ngày tham quan: {order.visitDate}</p>
  //           <p>Tổng tiền: {currencyFormatter.format(order.total)}</p>
  //           <Link to={`/orders/${order.id}`}>Xem chi tiết</Link>
  //         </li>
  //       ))}
  //     </ul>
  //   </section>
  // );

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Đơn hàng của tôi</h1>
      <div
        className={styles.tabs}
        role="group"
        aria-label="Lọc đơn hàng theo trạng thái"
      >
        {ORDER_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              className={`${styles.tab} ${isActive ? styles.activeTab : ""}`}
              key={filter.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label} ({getOrderCount(filter.value)})
            </button>
          );
        })}
      </div>
      {filteredOrders.length === 0 ? (
        <p className={styles.filterEmpty}>
          Không có đơn hàng thuộc trạng thái này.
        </p>
      ) : (
        <ul className={styles.orderList}>
          {filteredOrders.map((order) => (
            <li className={styles.orderItem} key={order.id}>
              <Link className={styles.orderRow} to={`/orders/${order.id}`}>
                <div className={styles.orderIdentity}>
                  <strong className={styles.orderId} title={order.id}>
                    {order.id}
                  </strong>

                  <span className={styles.orderDate}>
                    Đặt ngày {dateFormatter.format(new Date(order.createdAt))}
                  </span>
                </div>

                <span className={styles.orderSummary}>
                  {getOrderSummary(order)}
                </span>

                <StatusBadge status={order.status} />

                <strong className={styles.orderTotal}>
                  {currencyFormatter.format(order.total)}
                </strong>

                <svg
                  className={styles.chevron}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
