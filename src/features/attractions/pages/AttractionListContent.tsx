import AttractionCard from "../components/AttractionCard";
import AttractionCardSkeleton from "../components/AttractionCardSkeleton";
import styles from "./AttractionListPage.module.css";
import type { Attraction } from "../types";
import { memo } from "react";

const SKELETON_COUNT = 12;

export type AttractionListStatus = "loading" | "error" | "success";

interface AttractionListContentProps {
  pageStatus: AttractionListStatus;
  attractions: Attraction[];
  pageError: string;
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
  pageError,
  currentPage,
  totalPages,
  isUpdating,
  getParkName,
  onRetry,
  onClearFilters,
  onPageChange,
}: AttractionListContentProps) {
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

      {pageStatus === "error" && (
        <div className={styles.errorState}>
          <p role="alert">{pageError}</p>

          <button type="button" onClick={onRetry}>
            Thử lại
          </button>
        </div>
      )}

      {pageStatus === "success" && isUpdating && (
        <p role="status" aria-live="polite">
          Đang cập nhật danh sách...
        </p>
      )}

      {pageStatus === "success" && attractions.length === 0 && (
        <div className={styles.emptyState}>
          <h2>Không tìm thấy trải nghiệm</h2>
          <p>Hãy thử thay đổi từ khoá hoặc bộ lọc</p>
          <button type="button" onClick={onClearFilters}>
            Xoá bộ lọc
          </button>
        </div>
      )}

      {pageStatus === "success" && attractions.length > 0 && (
        <>
          <div className={styles.grid}>
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
                type="button"
                disabled={isUpdating || currentPage === 1}
                onClick={() => {
                  onPageChange(currentPage - 1);
                }}
              >
                Trang trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={isUpdating || currentPage >= totalPages}
                onClick={() => {
                  onPageChange(currentPage + 1);
                }}
              >
                Trang sau
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

export default memo(AttractionListContent);
