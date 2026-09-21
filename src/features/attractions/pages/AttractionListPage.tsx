import type {
  AttractionListResponse,
  Category,
  CategoryOption,
  Park,
} from "../types";
import AttractionCard from "../components/AttractionCard";
import styles from "./AttractionListPage.module.css";
import { useRef } from "react";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import AttractionCardSkeleton from "../components/AttractionCardSkeleton";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useFetch, type FetchStatus } from "@/hooks/useFetch";

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "THRILL", label: "Cảm giác mạnh" },
  { value: "FAMILY", label: "Gia đình" },
  { value: "KIDS", label: "Trẻ em" },
  { value: "SHOW", label: "Biểu diễn" },
  { value: "WATER", label: "Dưới nước" },
];
const PAGE_SIZE = 12;

export default function AttractionListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchText = searchParams.get("q") ?? "";
  const debouncedSearchText = useDebounce(searchText, 400);

  const selectedPark = searchParams.get("park") ?? "";
  const selectedSort = searchParams.get("sort") ?? "";
  const selectedCategories = searchParams.getAll("category");

  const pageFromUrl = Number(searchParams.get("page") ?? "1");
  const currentPage =
    Number.isInteger(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

  // let currentPage = 1;
  // if (Number.isInteger(pageFromUrl) && pageFromUrl > 0) {
  // 	return currentPage = pageFromUrl;
  // }

  const attractionParams = new URLSearchParams(searchParams);
  attractionParams.set("q", debouncedSearchText);
  attractionParams.set("page", String(currentPage));
  attractionParams.set("limit", String(PAGE_SIZE));

  const attractionsUrl = `${import.meta.env.VITE_API_BASE_URL}/attractions?${attractionParams.toString()}`;
  const {
    status: attractionsStatus,
    data: attractionsResponse,
    error: attractionsError,
    refetch: refetchAttractions,
  } = useFetch<AttractionListResponse>(attractionsUrl);

  const attractions = attractionsResponse?.data ?? [];
  const total = attractionsResponse?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const parksUrl = `${import.meta.env.VITE_API_BASE_URL}/parks`;
  const {
    status: parksStatus,
    data: parksData,
    error: parksError,
    refetch: refetchParks,
  } = useFetch<Park[]>(parksUrl);

  const parks = parksData ?? [];

  const searchInputRef = useRef<HTMLInputElement>(null);

  let pageStatus: FetchStatus;

  if (attractionsStatus === "error" || parksStatus === "error") {
    pageStatus = "error";
  } else if (
    searchText !== debouncedSearchText ||
    attractionsStatus === "loading" ||
    parksStatus === "loading"
  ) {
    pageStatus = "loading";
  } else {
    pageStatus = "success";
  }

  const pageError =
    attractionsError ?? parksError ?? "Không tải được danh sách";

  useKeyboardShortcut("/", (event) => {
    const target = event.target;

    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    if (isTyping) {
      return;
    }

    event.preventDefault();
    searchInputRef.current?.focus();
  });

  function getParkName(parkId: string) {
    const park = parks.find((item) => item.id === parkId);
    if (!park) {
      return parkId;
    }
    return park.name;
  }

  function handleSearchChange(value: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("q", value);
    nextParams.set("page", "1");
    setSearchParams(nextParams, { replace: true });
  }

  function handleParkChange(value: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set("park", value);
    } else {
      nextParams.delete("park");
    }
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }

  function handleSortChange(value: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set("sort", value);
    } else {
      nextParams.delete("sort");
    }
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }

  function handleCategoryChange(category: Category, checked: boolean) {
    const nextParams = new URLSearchParams(searchParams);
    if (checked) {
      nextParams.append("category", category);
    } else {
      nextParams.delete("category", category);
    }
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  }

  function handleClearFilters() {
    const nextParams = new URLSearchParams();
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }

  function handleRetry() {
    if (attractionsStatus === "error") {
      refetchAttractions();
    }
    if (parksStatus === "error") {
      refetchParks();
    }
  }
  return (
    <section className={styles.page}>
      <h1>Khám phá trải nghiệm</h1>
      <p>Tìm điểm vui chơi phù hợp cho chuyến đi của bạn.</p>
      <label htmlFor="attraction-search">Tìm kiếm trải nghiệm</label>
      <input
        className={styles.input}
        id="attraction-search"
        type="search"
        value={searchText}
        onChange={(e) => handleSearchChange(e.currentTarget.value)}
        placeholder="Nhập tên trải nghiệm"
        ref={searchInputRef}
      />
      <label htmlFor="park-filter">Khu vui chơi</label>
      <select
        id="park-filter"
        value={selectedPark}
        onChange={(e) => handleParkChange(e.currentTarget.value)}
      >
        <option value="">Tất cả khu vui chơi</option>
        {parks.map((park) => (
          <option key={park.id} value={park.id}>
            {park.name}
          </option>
        ))}
      </select>
      <label htmlFor="sort-filter">Sắp xếp</label>
      <select
        id="sort-filter"
        value={selectedSort}
        onChange={(e) => handleSortChange(e.currentTarget.value)}
      >
        <option value="">Mặc định</option>
        <option value="price_asc">Giá thấp đến cao</option>
        <option value="price_desc">Giá cao đến thấp</option>
        <option value="rating_desc">Rating cao nhất</option>
      </select>
      <fieldset className={styles.filterGroup}>
        <legend>Danh mục</legend>
        {CATEGORY_OPTIONS.map((option) => (
          <label key={option.value}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(option.value)}
              onChange={(e) =>
                handleCategoryChange(option.value, e.currentTarget.checked)
              }
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      {pageStatus === "loading" && (
        <div
          className={styles.grid}
          role="status"
          aria-label="Đang tải danh sách trải nghiệm"
        >
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <AttractionCardSkeleton key={index} />
          ))}
        </div>
      )}

      {pageStatus === "error" && (
        <div className={styles.errorState}>
          <p role="alert">{pageError}</p>

          <button type="button" onClick={handleRetry}>
            Thử lại
          </button>
        </div>
      )}

      {pageStatus === "success" && attractions.length === 0 && (
        <div className={styles.emptyState}>
          <h2>Không tìm thấy trải nghiệm</h2>
          <p>Hãy thử thay đổi từ khoá hoặc bộ lọc</p>
          <button type="button" onClick={handleClearFilters}>
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
                disabled={currentPage === 1}
                onClick={() => {
                  handlePageChange(currentPage - 1);
                }}
              >
                Trang trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  handlePageChange(currentPage + 1);
                }}
              >
                Trang sau
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
