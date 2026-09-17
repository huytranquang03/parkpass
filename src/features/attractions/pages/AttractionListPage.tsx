import type {
  Attraction,
  AttractionListResponse,
  Category,
  CategoryOption,
  Park,
} from "../types";
import AttractionCard from "../components/AttractionCard";
import styles from "./AttractionListPage.module.css";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import AttractionCardSkeleton from "../components/AttractionCardSkeleton";

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

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [retryCount, setRetryCount] = useState(0);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    if (searchText !== debouncedSearchText) {
      return;
    }
    const controller = new AbortController();
    async function loadAttractions() {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const apiParams = new URLSearchParams(searchParams);
        apiParams.set("q", debouncedSearchText);
        apiParams.set("page", String(currentPage));
        apiParams.set("limit", String(PAGE_SIZE));

        // const response = await fetch(
        // 	`${baseUrl}/attractions?q=${debouncedSearchText}&park=${selectedPark}&sort=${selectedSort}&page=1&limit=12`,
        // );

        const response = await fetch(
          `${baseUrl}/attractions?${apiParams.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Không tải được danh sách");
        }
        const result: AttractionListResponse = await response.json();
        const parksResponse = await fetch(`${baseUrl}/parks`, {
          signal: controller.signal,
        });

        if (!parksResponse.ok) {
          throw new Error("Không tải được danh sách khu vui chơi");
        }

        const parksResult: Park[] = await parksResponse.json();

        setTotal(result.total);
        setAttractions(result.data);
        setParks(parksResult);
        setStatus("success");
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        setError("Không tải được danh sách");
        setStatus("error");
      }
    }
    loadAttractions();
    return () => {
      controller.abort();
    };
  }, [searchParams, debouncedSearchText, searchText, currentPage, retryCount]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;

      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (event.key !== "/" || isTyping) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    setStatus("loading");
    setError(null);
    setSearchParams(nextParams);
  }

  function handleParkChange(value: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set("park", value);
    } else {
      nextParams.delete("park");
    }
    nextParams.set("page", "1");
    setStatus("loading");
    setError(null);
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
    setStatus("loading");
    setError(null);
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
    setStatus("loading");
    setError(null);
    setSearchParams(nextParams);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setStatus("loading");
    setError(null);
    setSearchParams(nextParams);
  }

  function handleClearFilters() {
    const nextParams = new URLSearchParams();
    nextParams.set("page", "1");
    setStatus("loading");
    setError(null);
    setSearchParams(nextParams);
  }

  function handleRetry() {
    setStatus("loading");
    setError(null);
    setRetryCount((prev) => prev + 1);
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
      {status === "loading" && (
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

      {status === "error" && (
        <div className={styles.errorState}>
          <p role="alert">{error}</p>

          <button type="button" onClick={handleRetry}>
            Thử lại
          </button>
        </div>
      )}

      {status === "success" && attractions.length === 0 && (
        <div className={styles.emptyState}>
          <h2>Không tìm thấy trải nghiệm</h2>
          <p>Hãy thử thay đổi từ khoá hoặc bộ lọc</p>
          <button type="button" onClick={handleClearFilters}>
            Xoá bộ lọc
          </button>
        </div>
      )}

      {status === "success" && attractions.length > 0 && (
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
