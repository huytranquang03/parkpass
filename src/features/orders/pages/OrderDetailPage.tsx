import { useAuth } from "@/features/auth/authContext";
import { useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import type { Order, OrderItem } from "../types";
import styles from "./OrderDetailPage.module.css";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ApiRequestError } from "@/lib/apiError";
import Toast from "@/components/ui/Toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderDetailOptions, orderKeys } from "../queries";
import { cancelOrder } from "../api";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

interface OrderDetailLocationState {
  successMessage?: string;
}
interface CancelOrderVariables {
  orderId: string;
  token: string;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const orderDateFormatter = new Intl.DateTimeFormat("vi-VN");

const orderTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

const visitDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// const STATUS_LABELS: Record<Order["status"], string> = {
//   PENDING: "Chờ thanh toán",
//   PAID: "Đã thanh toán",
//   CANCELLED: "Đã huỷ",
// };

const TICKET_LABELS: Record<OrderItem["ticketType"], string> = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  SENIOR: "Người cao tuổi",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();

  const location = useLocation();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const state = location.state as OrderDetailLocationState | null;
  const [toastMessage, setToastMessage] = useState(
    state?.successMessage ?? null,
  );

  const cancelDismissButtonRef = useRef<HTMLButtonElement>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success",
  );

  // const [isCancelling, setIsCancelling] = useState(false);
  // const requestInit = useMemo<RequestInit | undefined>(() => {
  //   if (!token) return undefined;

  //   return {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   };
  // }, [token]);

  // const {
  //   status,
  //   data: order,
  //   error,
  //   responseStatus,
  //   refetch,
  // } = useFetch<Order>(
  //   `${import.meta.env.VITE_API_BASE_URL}/orders/${id ?? "__missing__"}`,
  //   requestInit,
  // );

  const queryClient = useQueryClient();
  const {
    data: order,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery(orderDetailOptions(id ?? "__missing__", token));

  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, token }: CancelOrderVariables) =>
      cancelOrder(orderId, token),

    onMutate: async ({ orderId }) => {
      const detailKey = orderKeys.detail(orderId);
      const listKey = orderKeys.lists();

      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey }),
        queryClient.cancelQueries({ queryKey: listKey }),
      ]);

      const previousOrder = queryClient.getQueryData<Order>(detailKey);
      const previousOrders = queryClient.getQueryData<Order[]>(listKey);

      queryClient.setQueryData<Order>(detailKey, (currentOrder) =>
        currentOrder ? { ...currentOrder, status: "CANCELLED" } : currentOrder,
      );

      queryClient.setQueryData<Order[]>(listKey, (currentOrders) =>
        currentOrders?.map((currentOrder) =>
          currentOrder.id === orderId
            ? { ...currentOrder, status: "CANCELLED" }
            : currentOrder,
        ),
      );
      return {
        previousOrder,
        previousOrders,
      };
    },
    onError: (error, variables, snapshot) => {
      if (snapshot?.previousOrder) {
        queryClient.setQueryData(
          orderKeys.detail(variables.orderId),
          snapshot.previousOrder,
        );
      }
      if (snapshot?.previousOrders) {
        queryClient.setQueryData(orderKeys.lists(), snapshot.previousOrders);
      }
      setCancelError(
        error instanceof Error ? error.message : "Không thể hủy đơn hàng",
      );
      setToastVariant("error");
      setToastMessage("Không hủy được đơn, vui lòng thử lại");
    },
    onSuccess: () => {
      setIsCancelModalOpen(false);
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(variables.orderId),
        }),
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
      ]);
    },
  });

  function handleCancelOrder() {
    if (!token || !order || cancelOrderMutation.isPending) {
      return;
    }
    setCancelError(null);
    cancelOrderMutation.mutate({
      orderId: order.id,
      token,
    });
  }

  // async function handleCancelOrder() {
  //   if (!token || !order || isCancelling) return;
  //   setIsCancelling(true);
  //   setCancelError(null);
  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_BASE_URL}/orders/${order.id}/cancel`,
  //       { method: "PATCH", headers: { Authorization: `Bearer ${token}` } },
  //     );

  //     if (!response.ok) {
  //       const apiError = (await response.json()) as ApiError;
  //       throw new Error(apiError.message);
  //     }
  //     setIsCancelModalOpen(false);
  //     refetch();
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       setCancelError(error.message);
  //     } else {
  //       setCancelError("Không thể hủy đơn hàng");
  //     }
  //   } finally {
  //     setIsCancelling(false);
  //   }
  // }

  // useEffect(() => {
  //   if (!toastMessage) return;

  //   const timer = setTimeout(() => {
  //     setToastMessage(null);
  //   }, 3000);

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [toastMessage]);

  if (isPending) {
    return (
      <section
        className={styles.page}
        aria-busy="true"
        aria-label="Đang tải chi tiết đơn hàng"
      >
        <span className={styles.visuallyHidden} role="status">
          Đang tải chi tiết đơn hàng...
        </span>

        <Skeleton className={styles.skeletonBackLink} />
        <Skeleton className={styles.skeletonHeading} />
        <Skeleton className={styles.skeletonTable} />

        <div className={styles.skeletonDetails}>
          <Skeleton className={styles.skeletonInfo} />
          <Skeleton className={styles.skeletonSummary} />
        </div>
      </section>
    );
  }

  if (isError && error instanceof ApiRequestError && error.status === 404) {
    return (
      <section className={styles.page}>
        <div className={styles.statePanel}>
          <EmptyState
            title="Không tìm thấy đơn hàng"
            description="Đơn hàng này không tồn tại hoặc bạn không có quyền xem."
            action={
              <Link className={styles.secondaryLink} to="/orders">
                Quay lại danh sách đơn hàng
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.page}>
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

  if (!order) return null;
  const createdAt = new Date(order.createdAt);
  const visitDate = new Date(`${order.visitDate}T00:00:00`);

  function handleCloseCancelModal() {
    if (cancelOrderMutation.isPending) {
      return;
    }
    setIsCancelModalOpen(false);
  }

  return (
    <>
      <section
        className={`${styles.page} ${
          cancelOrderMutation.isPending ? styles.mutating : ""
        }`}
      >
        <Link className={styles.backLink} to="/orders">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Đơn hàng của tôi
        </Link>

        <div className={styles.header}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Đơn {order.id}</h1>

            <StatusBadge status={order.status} />

            <span className={styles.createdAt}>
              Đặt ngày {orderDateFormatter.format(createdAt)} ·{" "}
              {orderTimeFormatter.format(createdAt)}
            </span>
          </div>

          {order.status === "PENDING" && (
            <Button
              type="button"
              variant="dangerSecondary"
              onClick={() => {
                setIsCancelModalOpen(true);
                setCancelError(null);
              }}
            >
              Hủy đơn
            </Button>
          )}
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.ticketTable}>
            <caption className={styles.visuallyHidden}>Vé đã đặt</caption>

            <thead>
              <tr>
                <th scope="col">Attraction</th>
                <th scope="col">Loại vé</th>
                <th className={styles.numericCell} scope="col">
                  SL
                </th>
                <th className={styles.numericCell} scope="col">
                  Đơn giá
                </th>
                <th className={styles.numericCell} scope="col">
                  Thành tiền
                </th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item) => (
                <tr key={`${item.attractionId}-${item.ticketType}`}>
                  <th className={styles.attractionCell} scope="row">
                    {item.attractionName}
                  </th>

                  <td className={styles.ticketTypeCell}>
                    {TICKET_LABELS[item.ticketType]}
                  </td>

                  <td className={styles.numericCell}>{item.quantity}</td>

                  <td className={styles.numericCell}>
                    {currencyFormatter.format(item.unitPrice)}
                  </td>

                  <td className={`${styles.numericCell} ${styles.lineTotal}`}>
                    {currencyFormatter.format(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.detailRow}>
          <dl className={styles.orderInfo}>
            <div className={styles.infoItem}>
              <dt>Người đặt</dt>
              <dd>
                {user ? `${user.name} · ${user.email}` : "Không có thông tin"}
              </dd>
            </div>

            <div className={styles.infoItem}>
              <dt>Ngày tham quan</dt>
              <dd>{visitDateFormatter.format(visitDate)}</dd>
            </div>

            <div className={styles.infoItem}>
              <dt>Mã khuyến mãi</dt>
              <dd>{order.promoCode ?? "Không áp dụng"}</dd>
            </div>
          </dl>

          <div className={styles.summaryCard}>
            <div className={styles.summaryLine}>
              <span>Tạm tính</span>
              <strong>{currencyFormatter.format(order.subtotal)}</strong>
            </div>

            <div className={styles.summaryLine}>
              <span>Giảm giá</span>
              <span>
                {order.discount > 0
                  ? `-${currencyFormatter.format(order.discount)}`
                  : "Không áp dụng"}
              </span>
            </div>

            <div className={styles.summaryTotal}>
              <span>Tổng</span>
              <strong>{currencyFormatter.format(order.total)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* <Modal
        open={isCancelModalOpen}
        title="Xác nhận huỷ đơn"
        onClose={() => setIsCancelModalOpen(false)}
      >
        <p>Bạn có chắc muốn huỷ đơn hàng này không?</p>

        {cancelError && <p role="alert">{cancelError}</p>}

        <Button
          type="button"
          onClick={() => handleCancelOrder()}
          disabled={cancelOrderMutation.isPending}
        >
          {cancelOrderMutation.isPending ? "Đang huỷ..." : "Xác nhận huỷ"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsCancelModalOpen(false)}
          disabled={cancelOrderMutation.isPending}
        >
          Không, quay lại
        </Button>
      </Modal> */}

      <Modal
        open={isCancelModalOpen}
        title={`Hủy đơn ${order.id}?`}
        description="Vé chưa thanh toán sẽ bị hủy ngay và không thể khôi phục. Bạn vẫn có thể đặt lại sau."
        initialFocusRef={cancelDismissButtonRef}
        onClose={handleCloseCancelModal}
        icon={
          <span className={styles.cancelIcon} aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </span>
        }
      >
        {cancelError && (
          <p className={styles.cancelError} role="alert">
            {cancelError}
          </p>
        )}

        <div className={styles.modalActions}>
          <Button
            ref={cancelDismissButtonRef}
            type="button"
            variant="secondary"
            onClick={handleCloseCancelModal}
            disabled={cancelOrderMutation.isPending}
          >
            Quay lại
          </Button>

          <Button
            type="button"
            variant="danger"
            loading={cancelOrderMutation.isPending}
            onClick={handleCancelOrder}
          >
            Hủy đơn
          </Button>
        </div>
      </Modal>

      {/* {toastMessage && <Toast message={toastMessage} />} */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
}
