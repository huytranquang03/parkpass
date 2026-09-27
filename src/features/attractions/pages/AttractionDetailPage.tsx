import { Link, useParams } from "react-router";
import type { Attraction, TicketOption, TicketType } from "../types";
import { useEffect, useRef, useState } from "react";
import styles from "./AttractionDetailPage.module.css";
import { createPortal } from "react-dom";
import QuantityStepper from "@/components/ui/QuantityStepper";
import type { CartItem } from "@/features/cart/types";
import { useCart } from "@/features/cart/cartContext";
import { useFetch } from "@/hooks/useFetch";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import ReviewWidget from "@/features/reviews/components/ReviewsWidget";

const TICKET_OPTIONS: TicketOption[] = [
  { type: "ADULT", label: "Người lớn" },
  { type: "CHILD", label: "Trẻ em" },
  { type: "SENIOR", label: "Người cao tuổi" },
];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const INITIAL_QUANTITIES: Record<TicketType, number> = {
  ADULT: 0,
  CHILD: 0,
  SENIOR: 0,
};

export default function AttractionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const attractionUrl = `${import.meta.env.VITE_API_BASE_URL}/attractions/${id ?? "__missing__"}`;

  const {
    status,
    data: attraction,
    error,
    responseStatus,
    refetch,
  } = useFetch<Attraction>(attractionUrl);

  const isNotFound = status === "error" && responseStatus === 404;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const lastImageTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [quantities, setQuantities] =
    useState<Record<TicketType, number>>(INITIAL_QUANTITIES);

  const totalQuantity = Object.values(quantities).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { dispatch } = useCart();
  // const [status, setStatus] = useState<
  //   "loading" | "success" | "error" | "not-found"
  // >("loading");

  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!id) {
  //     return;
  //   }
  //   const controller = new AbortController();
  //   async function loadAttraction() {
  //     try {
  //       const baseUrl = import.meta.env.VITE_API_BASE_URL;
  //       const response = await fetch(`${baseUrl}/attractions/${id}`, {
  //         signal: controller.signal,
  //       });
  //       if (response.status === 404) {
  //         setStatus("not-found");
  //         return;
  //       }
  //       if (!response.ok) {
  //         throw new Error("Không tải được thông tin trải nghiệm");
  //       }
  //       const result: Attraction = await response.json();
  //       setAttraction(result);
  //       setStatus("success");
  //     } catch {
  //       if (controller.signal.aborted) {
  //         return;
  //       }
  //       setError("Không tải được thông tin trải nghiệm");
  //       setStatus("error");
  //     }
  //   }
  //   loadAttraction();
  //   return () => {
  //     controller.abort();
  //   };
  // }, [id]);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      event.preventDefault();
      setSelectedImage(null);
      lastImageTriggerRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);

  function handleOpenLightbox(image: string, trigger: HTMLButtonElement) {
    lastImageTriggerRef.current = trigger;
    setSelectedImage(image);
  }

  function handleCloseLightbox() {
    setSelectedImage(null);
    lastImageTriggerRef.current?.focus();
  }

  function handleQuantityChange(ticketType: TicketType, quantity: number) {
    setQuantities((currentQuantity) => ({
      ...currentQuantity,
      [ticketType]: quantity,
    }));
  }

  function handleAddToCart() {
    if (!attraction || totalQuantity === 0) {
      return;
    }
    const selectedItems: CartItem[] = TICKET_OPTIONS.filter(
      (ticket) => quantities[ticket.type] > 0,
    ).map((ticket) => ({
      attractionId: attraction.id,
      attractionName: attraction.name,
      ticketType: ticket.type,
      price: attraction.prices[ticket.type],
      quantity: quantities[ticket.type],
    }));
    dispatch({
      type: "ADD_ITEMS",
      payload: selectedItems,
    });
    setToastMessage(`Đã thêm ${totalQuantity} vé vào giỏ hàng`);
    setQuantities({ ...INITIAL_QUANTITIES });
  }

  return (
    <>
      {status === "loading" && <p>Đang tải...</p>}

      {status === "error" && !isNotFound && (
        <div>
          <p role="alert">{error ?? "Không tải được thông tin trải nghiệm"}</p>

          <button type="button" onClick={refetch}>
            Thử lại
          </button>
        </div>
      )}

      {isNotFound && (
        <section>
          <h1>Không tìm thấy trải nghiệm</h1>
          <p>Trải nghiệm này không tồn tại hoặc đã bị xóa.</p>
          <Link to="/">Quay lại danh sách</Link>
        </section>
      )}

      {status === "success" && attraction && (
        <section className={styles.page}>
          <Link to="/">← Quay lại danh sách</Link>
          <h1>{attraction.name}</h1>
          <p>{attraction.description}</p>

          <section>
            <h2>Giá vé</h2>
            <dl className={styles.priceList}>
              {TICKET_OPTIONS.map((ticket) => {
                const price = attraction.prices[ticket.type];
                return (
                  <div className={styles.priceRow} key={ticket.type}>
                    <div>
                      <dt>{ticket.label}</dt>
                      <dd>{currencyFormatter.format(price)}</dd>
                    </div>
                    <QuantityStepper
                      value={quantities[ticket.type]}
                      onChange={(quantity) =>
                        handleQuantityChange(ticket.type, quantity)
                      }
                    />
                  </div>
                );
              })}
            </dl>
          </section>

          <p>Tổng số vé: {totalQuantity}</p>
          <button
            type="button"
            onClick={handleAddToCart}
            className={styles.addToCartButton}
            disabled={totalQuantity === 0}
          >
            Thêm vào giỏ hàng
          </button>
          <p>Danh mục: {attraction.category}</p>
          <p>Đánh giá: {attraction.rating}/5</p>

          <section>
            <h2>Hình ảnh</h2>
            <div className={styles.gallery}>
              {attraction.images.map((image, index) => (
                <button
                  type="button"
                  key={image}
                  aria-label={`Mở ảnh ${index + 1} của ${attraction.name}`}
                  className={styles.galleryButton}
                  onClick={(e) => handleOpenLightbox(image, e.currentTarget)}
                >
                  <img
                    className={styles.galleryImage}
                    src={image}
                    alt={`${attraction.name} - ảnh ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </section>

          <ErrorBoundary fallbackMessage="Không thể tải phần đánh giá.">
            <ReviewWidget attractionId={attraction.id} />
          </ErrorBoundary>

          {selectedImage &&
            createPortal(
              <div
                className={styles.lightboxOverlay}
                role="dialog"
                aria-modal="true"
                aria-label={`Ảnh phóng to của ${attraction.name}`}
              >
                <div className={styles.lightboxContent}>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={handleCloseLightbox}
                    aria-label="Đóng ảnh phóng to"
                    ref={closeButtonRef}
                  >
                    ×
                  </button>

                  <img
                    className={styles.lightboxImage}
                    src={selectedImage}
                    alt={`${attraction.name} phóng to`}
                  />
                </div>
              </div>,
              document.body,
            )}

          {toastMessage && (
            <div className={styles.toast} role="status">
              {toastMessage}
            </div>
          )}
        </section>
      )}
    </>
  );
}
