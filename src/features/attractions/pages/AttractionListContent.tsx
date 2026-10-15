import AttractionCard from "../components/AttractionCard";
import AttractionCardSkeleton from "../components/AttractionCardSkeleton";
import styles from "./AttractionListPage.module.css";
import type { Attraction } from "../types";
import { memo } from "react";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

const SKELETON_COUNT = 8;

export type AttractionListStatus = "loading" | "error" | "success";

interface AttractionListContentProps {
  pageStatus: AttractionListStatus;
  attractions: Attraction[];
  // pageError: string;
  currentPage: number;
  totalPages: number;
  isUpdating: boolean;
  getParkName: (parkId: string) => string;
  onRetry: () => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

function AttractionListContent({
  pageStatus,
  attractions,
  // pageError,
  currentPage,
  totalPages,
  isUpdating,
  getParkName,
  onRetry,
  onClearFilters,
  onPageChange,
}: AttractionListContentProps) {
  const gridClassName = isUpdating
    ? `${styles.grid} ${styles.gridUpdating}`
    : styles.grid;

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );
  return (
    <>
      {pageStatus === "loading" && (
        <div
          className={styles.grid}
          role="status"
          aria-label="Đang tải danh sách trải nghiệm"
        >
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <AttractionCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* {pageStatus === "error" && (
        <div className={styles.errorState}>
          <p role="alert">{pageError}</p>

          <button type="button" onClick={onRetry}>
            Thử lại
          </button>
        </div>
      )} */}

      {pageStatus === "error" && (
        <ErrorState
          title="Không tải được dữ liệu"
          description="Kết nối có vấn đề hoặc hệ thống đang bận. Thử lại giúp mình nhé."
          action={
            <Button variant="secondary" onClick={onRetry}>
              Thử lại
            </Button>
          }
        />
      )}

      {pageStatus === "success" && isUpdating && (
        <span
          className={styles.visuallyHidden}
          role="status"
          aria-live="polite"
        >
          Đang cập nhật danh sách...
        </span>
      )}

      {pageStatus === "success" && attractions.length === 0 && (
        <EmptyState
          title="Không tìm thấy attraction nào"
          description="Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm."
          action={
            <Button variant="secondary" onClick={onClearFilters}>
              Xóa bộ lọc
            </Button>
          }
        />
      )}

      {pageStatus === "success" && attractions.length > 0 && (
        <>
          <div className={gridClassName} aria-busy={isUpdating || undefined}>
            {attractions.map((item) => (
              <AttractionCard
                key={item.id}
                attraction={item}
                parkName={getParkName(item.parkId)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Phân trang" className={styles.pagination}>
              <button
                className={styles.paginationButton}
                type="button"
                aria-label="Trang trước"
                disabled={isUpdating || currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {pageNumbers.map((page) => (
                <button
                  className={`${styles.paginationButton} ${
                    page === currentPage ? styles.paginationButtonActive : ""
                  }`}
                  type="button"
                  key={page}
                  aria-current={page === currentPage ? "page" : undefined}
                  disabled={isUpdating}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className={styles.paginationButton}
                type="button"
                aria-label="Trang sau"
                disabled={isUpdating || currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
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
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

export default memo(AttractionListContent);
