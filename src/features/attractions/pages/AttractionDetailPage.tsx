import { Link, useParams } from "react-router";
import type { Category, TicketOption, TicketType } from "../types";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import styles from "./AttractionDetailPage.module.css";
import { createPortal } from "react-dom";
import QuantityStepper from "@/components/ui/QuantityStepper";
import type { CartItem } from "@/features/cart/types";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import ReviewWidget from "@/features/reviews/components/ReviewsWidget";
import Toast from "@/components/ui/Toast";
import ParkClosingCountdownClass from "../components/ParkClosingCountdownClass";
import { QueryErrorResetBoundary, useQuery } from "@tanstack/react-query";
import { attractionDetailOptions, parksOptions } from "../queries";
import { ApiRequestError } from "@/lib/apiError";
import { useCartStore } from "@/features/cart/cartStore";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

const SKELETON_THUMBNAIL_COUNT = 4;

const TICKET_OPTIONS: TicketOption[] = [
  { type: "ADULT", label: "Người lớn" },
  { type: "CHILD", label: "Trẻ em" },
  { type: "SENIOR", label: "Người cao tuổi" },
];

const CATEGORY_LABELS: Record<Category, string> = {
  THRILL: "Cảm giác mạnh",
  FAMILY: "Gia đình",
  KIDS: "Trẻ em",
  SHOW: "Biểu diễn",
  WATER: "Dưới nước",
};

const TICKET_DESCRIPTIONS: Record<TicketType, string> = {
  ADULT: "Từ 12 tuổi",
  CHILD: "Cao từ 1m đến 1m4",
  SENIOR: "Từ 60 tuổi",
};

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
  const lightboxTitleId = useId();
  // const attractionUrl = `${import.meta.env.VITE_API_BASE_URL}/attractions/${id ?? "__missing__"}`;

  // const {
  //   status,
  //   data: attraction,
  //   error,
  //   responseStatus,
  //   refetch,
  // } = useFetch<Attraction>(attractionUrl);

  // const isNotFound = status === "error" && responseStatus === 404;

  const attractionId = id ?? "__missing__";

  const {
    data: attraction,
    error,
    isPending,
    isError,
    isSuccess,
    refetch,
  } = useQuery(attractionDetailOptions(attractionId));

  const { data: parks } = useQuery(parksOptions);

  const isNotFound =
    isError && error instanceof ApiRequestError && error.status === 404;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const lastImageTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [quantities, setQuantities] =
    useState<Record<TicketType, number>>(INITIAL_QUANTITIES);

  const totalQuantity = Object.values(quantities).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const totalPrice = TICKET_OPTIONS.reduce(
    (total, ticket) =>
      total + (attraction?.prices[ticket.type] ?? 0) * quantities[ticket.type],
    0,
  );
  const activeImage =
    attraction?.images[activeImageIndex] ?? attraction?.images[0];
  const park = parks?.find((item) => item.id === attraction?.parkId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addItems = useCartStore((state) => state.addItems);

  // const { dispatch } = useCart();
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      lastImageTriggerRef.current?.focus();
    };
  }, [selectedImage]);

  // useEffect(() => {
  //   if (!toastMessage) {
  //     return;
  //   }
  //   const timer = setTimeout(() => {
  //     setToastMessage(null);
  //   }, 3000);

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [toastMessage]);

  function handleOpenLightbox(image: string, trigger: HTMLButtonElement) {
    lastImageTriggerRef.current = trigger;
    setSelectedImage(image);
  }

  function handleCloseLightbox() {
    setSelectedImage(null);
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
      imageUrl: attraction.images[0],
      ticketType: ticket.type,
      price: attraction.prices[ticket.type],
      quantity: quantities[ticket.type],
    }));
    // dispatch({
    //   type: "ADD_ITEMS",
    //   payload: selectedItems,
    // });
    addItems(selectedItems);
    setToastMessage(`Đã thêm ${totalQuantity} vé vào giỏ`);
    setQuantities({ ...INITIAL_QUANTITIES });
  }

  return (
    <>
      {isPending && (
        <div
          className={styles.page}
          role="status"
          aria-label="Đang tải thông tin trải nghiệm"
        >
          <Skeleton className={styles.breadcrumbSkeleton} />

          <div className={styles.detailLayout}>
            <div className={styles.detailContent}>
              <Skeleton className={styles.mainImageSkeleton} />
              <div className={styles.thumbnailSkeletonList}>
                {Array.from(
                  { length: SKELETON_THUMBNAIL_COUNT },
                  (_, index) => (
                    <Skeleton
                      className={styles.thumbnailSkeleton}
                      key={index}
                    />
                  ),
                )}
              </div>
              <Skeleton className={styles.titleSkeleton} />
              <Skeleton className={styles.metaSkeleton} />
              <Skeleton className={styles.textSkeleton} />
              <Skeleton className={styles.textSkeletonShort} />
            </div>

            <aside
              className={styles.bookingBox}
              aria-label="Đang tải thông tin đặt vé"
            >
              <Skeleton className={styles.bookingTitleSkeleton} />
              <Skeleton className={styles.bookingTextSkeleton} />
              {TICKET_OPTIONS.map((ticket) => (
                <Skeleton
                  className={styles.bookingRowSkeleton}
                  key={ticket.type}
                />
              ))}
              <Skeleton className={styles.bookingButtonSkeleton} />
            </aside>
          </div>
        </div>
      )}

      {isError && !isNotFound && (
        <div className={`${styles.page} ${styles.pageState}`}>
          <ErrorState
            title="Không tải được thông tin trải nghiệm"
            description={
              error.message || "Kết nối có vấn đề hoặc hệ thống đang bận."
            }
            action={
              <Button variant="secondary" onClick={() => void refetch()}>
                Thử lại
              </Button>
            }
          />
        </div>
      )}

      {isNotFound && (
        <div className={`${styles.page} ${styles.pageState}`}>
          <EmptyState
            title="Không tìm thấy trải nghiệm"
            description="Trải nghiệm này không tồn tại hoặc đã bị xóa."
            action={
              <Link className={styles.stateActionLink} to="/">
                Quay lại danh sách
              </Link>
            }
          />
        </div>
      )}

      {isSuccess && attraction && (
        <div className={styles.page}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>

            <span aria-current="page">{attraction.name}</span>
          </nav>

          <div className={styles.detailLayout}>
            <div className={styles.detailContent}>
              <section className={styles.gallerySection}>
                <h2 className={styles.visuallyHidden}>Hình ảnh</h2>
                <div className={styles.gallery}>
                  {activeImage && (
                    <button
                      type="button"
                      aria-label={`Mở ảnh chính của ${attraction.name}`}
                      className={styles.mainImageButton}
                      onClick={(e) =>
                        handleOpenLightbox(activeImage, e.currentTarget)
                      }
                    >
                      <ImageWithFallback
                        className={styles.mainImage}
                        fallbackClassName={styles.mainImageFallback}
                        src={activeImage}
                        alt={attraction.name}
                      />
                    </button>
                  )}

                  <div className={styles.thumbnailList}>
                    {attraction.images.map((image, index) => {
                      const isActive = index === activeImageIndex;

                      return (
                        <button
                          type="button"
                          key={image}
                          aria-label={`Xem ảnh ${index + 1} của ${attraction.name}`}
                          aria-pressed={isActive}
                          className={`${styles.thumbnailButton} ${
                            isActive ? styles.thumbnailButtonActive : ""
                          }`}
                          onClick={() => setActiveImageIndex(index)}
                        >
                          <ImageWithFallback
                            className={styles.thumbnailImage}
                            fallbackClassName={styles.thumbnailImageFallback}
                            src={image}
                            alt=""
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <h1 className={styles.detailTitle}>{attraction.name}</h1>

              <div className={styles.detailMeta}>
                <Link
                  className={styles.parkLink}
                  to={`/?park=${attraction.parkId}&page=1`}
                >
                  {park?.name ?? attraction.parkId}
                </Link>

                <span className={styles.rating}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="m12 2 3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                  </svg>
                  <strong>{attraction.rating.toFixed(1)}</strong>
                </span>

                <span className={styles.categoryBadge}>
                  {CATEGORY_LABELS[attraction.category]}
                </span>
              </div>

              <section className={styles.introduction}>
                <h2>Giới thiệu</h2>
                <p>{attraction.description}</p>
              </section>

              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Giờ hoạt động</span>
                    <div className={styles.infoValue}>
                      <ParkClosingCountdownClass closingHour={21} />
                    </div>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 9V6h20v3a3 3 0 0 0 0 6v3H2v-3a3 3 0 0 0 0-6z" />
                      <path d="M13 6v12" />
                    </svg>
                  </span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Danh mục</span>
                    <span className={styles.infoValue}>
                      {CATEGORY_LABELS[attraction.category]}
                    </span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Địa điểm</span>
                    <span className={styles.infoValue}>
                      {park ? `${park.name}, ${park.city}` : attraction.parkId}
                    </span>
                  </div>
                </div>
              </div>

              {/* <ErrorBoundary fallbackMessage="Không thể tải phần đánh giá.">
                <ReviewWidget attractionId={attraction.id} />
              </ErrorBoundary> */}
              <section className={styles.reviewsSection}>
                <h2>Đánh giá từ khách</h2>

                <div className={styles.reviewsPanel}>
                  <QueryErrorResetBoundary>
                    {({ reset }) => (
                      <ErrorBoundary
                        onReset={reset}
                        renderFallback={(resetError) => (
                          <div className={styles.reviewFeedback}>
                            <ErrorState
                              title="Không tải được đánh giá"
                              description="Phần còn lại của trang vẫn dùng bình thường. Thử tải lại widget này."
                              action={
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={resetError}
                                >
                                  Thử lại
                                </Button>
                              }
                            />
                          </div>
                        )}
                      >
                        <Suspense
                          fallback={
                            <div
                              className={styles.reviewLoading}
                              role="status"
                              aria-label="Đang tải đánh giá"
                            >
                              <Skeleton className={styles.reviewLineSkeleton} />
                              <Skeleton
                                className={styles.reviewLineSkeletonShort}
                              />
                            </div>
                          }
                        >
                          <ReviewWidget attractionId={attraction.id} />
                        </Suspense>
                      </ErrorBoundary>
                    )}
                  </QueryErrorResetBoundary>
                </div>
              </section>
            </div>

            <aside className={styles.bookingBox} aria-label="Đặt vé">
              <h2 className={styles.bookingTitle}>Chọn vé</h2>
              <p className={styles.bookingDescription}>
                Giá đã gồm VAT. Ngày tham quan chọn ở bước thanh toán.
              </p>

              <dl className={styles.priceList}>
                {TICKET_OPTIONS.map((ticket) => {
                  const price = attraction.prices[ticket.type];
                  return (
                    <div className={styles.priceRow} key={ticket.type}>
                      <div className={styles.ticketInfo}>
                        <dt className={styles.ticketName}>{ticket.label}</dt>
                        <dd className={styles.ticketDescription}>
                          {TICKET_DESCRIPTIONS[ticket.type]} ·{" "}
                          <strong>{currencyFormatter.format(price)}</strong>
                        </dd>
                      </div>
                      <QuantityStepper
                        value={quantities[ticket.type]}
                        label={ticket.label}
                        onChange={(quantity) =>
                          handleQuantityChange(ticket.type, quantity)
                        }
                      />
                    </div>
                  );
                })}
              </dl>

              <div className={styles.bookingBottomBar}>
                <div className={styles.bookingTotal}>
                  <span className={styles.bookingTotalLabel}>
                    Tạm tính ({totalQuantity} vé)
                  </span>
                  <strong className={styles.bookingTotalPrice}>
                    {currencyFormatter.format(totalPrice)}
                  </strong>
                </div>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className={styles.addToCartButton}
                  disabled={totalQuantity === 0}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  Thêm vào giỏ
                </Button>
              </div>

              <p className={styles.bookingCaption}>
                Có thể đổi số lượng trong giỏ vé trước khi thanh toán.
              </p>
            </aside>
          </div>

          {selectedImage &&
            createPortal(
              <div className={styles.lightboxOverlay}>
                <button
                  type="button"
                  className={styles.lightboxBackdrop}
                  aria-label="Đóng ảnh phóng to"
                  tabIndex={-1}
                  onClick={handleCloseLightbox}
                />

                <section
                  className={styles.lightboxContent}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={lightboxTitleId}
                >
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={handleCloseLightbox}
                    aria-label="Đóng ảnh phóng to"
                    ref={closeButtonRef}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <h2 id={lightboxTitleId} className={styles.visuallyHidden}>
                    Ảnh phóng to của {attraction.name}
                  </h2>
                  <ImageWithFallback
                    className={styles.lightboxImage}
                    fallbackClassName={styles.lightboxImageFallback}
                    src={selectedImage}
                    alt={`${attraction.name} phóng to`}
                  />
                </section>
              </div>,
              document.body,
            )}
          {/* {toastMessage && <Toast message={toastMessage} />} */}
          {toastMessage && (
            <Toast
              message={toastMessage}
              onClose={() => setToastMessage(null)}
            />
          )}
        </div>
      )}
    </>
  );
}
