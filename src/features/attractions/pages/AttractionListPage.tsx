import type {
  Attraction,
  AttractionListFilters,
  Category,
  CategoryOption,
  Park,
} from "../types";
import styles from "./AttractionListPage.module.css";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import AttractionFilters from "./AttractionFilters";
import AttractionListContent, {
  type AttractionListStatus,
} from "./AttractionListContent";
import { useQuery } from "@tanstack/react-query";
import { attractionListOptions, parksOptions } from "../queries";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "THRILL", label: "Cảm giác mạnh" },
  { value: "FAMILY", label: "Gia đình" },
  { value: "KIDS", label: "Trẻ em" },
  { value: "SHOW", label: "Biểu diễn" },
  { value: "WATER", label: "Dưới nước" },
];

const DEFAULT_PAGE_SIZE = 12;
const LARGE_DATASET_SIZE = 500;
const EMPTY_ATTRACTIONS: Attraction[] = [];
const EMPTY_PARKS: Park[] = [];

export default function AttractionListPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchText = searchParams.get("q") ?? "";

  const selectedPark = searchParams.get("park") ?? "";
  const selectedSort = searchParams.get("sort") ?? "";
  const selectedCategories = searchParams.getAll("category");

  const hasActiveFilters =
    searchText !== "" ||
    selectedPark !== "" ||
    selectedSort !== "" ||
    selectedCategories.length > 0;
  const activeFilterCount =
    Number(selectedPark !== "") +
    Number(selectedSort !== "") +
    selectedCategories.length;
  const hasActiveDrawerFilters = activeFilterCount > 0;
  // const [isSearchPending, startSearchTransition] = useTransition();

  const pageFromUrl = Number(searchParams.get("page") ?? "1");
  const currentPage =
    Number.isInteger(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

  const pageSize =
    localStorage.getItem("pp:large") === "1"
      ? LARGE_DATASET_SIZE
      : DEFAULT_PAGE_SIZE;

  const attractionFilters: AttractionListFilters = {
    q: searchText,
    park: selectedPark,
    sort: selectedSort,
    categories: [...selectedCategories].sort(),
    page: currentPage,
    limit: pageSize,
  };

  const {
    data: attractionsResponse,
    // error: attractionsError,
    isPending: attractionsPending,
    isError: attractionsIsError,
    isPlaceholderData,
    refetch: refetchAttractions,
  } = useQuery(attractionListOptions(attractionFilters));

  // const attractionParams = new URLSearchParams(searchParams);
  // if (searchText) {
  //   attractionParams.set("q", searchText);
  // } else {
  //   attractionParams.delete("q");
  // }
  // attractionParams.set("page", String(currentPage));
  // attractionParams.set("limit", String(pageSize));

  // const attractionsUrl = `${import.meta.env.VITE_API_BASE_URL}/attractions?${attractionParams.toString()}`;
  // const {
  //   status: attractionsStatus,
  //   data: attractionsResponse,
  //   error: attractionsError,
  //   refetch: refetchAttractions,
  // } = useFetch<AttractionListResponse>(attractionsUrl);

  const attractions = attractionsResponse?.data ?? EMPTY_ATTRACTIONS;
  const total = attractionsResponse?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const {
    data: parksData,
    // error: parksError,
    isPending: parksPending,
    isError: parksIsError,
    refetch: refetchParks,
  } = useQuery(parksOptions);

  const parks = parksData ?? EMPTY_PARKS;

  // const searchInputRef = useRef<HTMLInputElement>(null);

  // let pageStatus: FetchStatus;

  // if (attractionsStatus === "error" || parksStatus === "error") {
  //   pageStatus = "error";
  // } else if (attractionsStatus === "loading" || parksStatus === "loading") {
  //   pageStatus = "loading";
  // } else {
  //   pageStatus = "success";
  // }

  let pageStatus: AttractionListStatus;

  if (attractionsIsError || parksIsError) {
    pageStatus = "error";
  } else if (attractionsPending || parksPending) {
    pageStatus = "loading";
  } else {
    pageStatus = "success";
  }

  // const pageError =
  //   attractionsError ?? parksError ?? "Không tải được danh sách";

  // const pageError =
  //   attractionsError?.message ||
  //   parksError?.message ||
  //   "Không tải được danh sách";

  // const handleSearchCommit = useCallback(
  //   (value: string) => {
  //     startSearchTransition(() => {
  //       setSearchParams((currentParams) => {
  //         const nextParams = new URLSearchParams(currentParams);
  //         if (value) {
  //           nextParams.set("q", value);
  //         } else {
  //           nextParams.delete("q");
  //         }
  //         nextParams.set("page", "1");
  //         return nextParams;
  //       });
  //     });
  //   },
  //   [setSearchParams, startSearchTransition],
  // );

  // useKeyboardShortcut("/", (event) => {
  //   const target = event.target;

  //   const isTyping =
  //     target instanceof HTMLInputElement ||
  //     target instanceof HTMLTextAreaElement ||
  //     (target instanceof HTMLElement && target.isContentEditable);

  //   if (isTyping) {
  //     return;
  //   }

  //   event.preventDefault();
  //   searchInputRef.current?.focus();
  // });

  function getParkName(parkId: string) {
    const park = parks.find((item) => item.id === parkId);

    if (!park) {
      return parkId;
    }

    return park.name;
  }

  const handleParkChange = useCallback(
    (value: string) => {
      const nextParams = new URLSearchParams(searchParams);
      if (value) {
        nextParams.set("park", value);
      } else {
        nextParams.delete("park");
      }
      nextParams.set("page", "1");
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const nextParams = new URLSearchParams(searchParams);
      if (value) {
        nextParams.set("sort", value);
      } else {
        nextParams.delete("sort");
      }
      nextParams.set("page", "1");
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams],
  );

  const handleCategoryChange = useCallback(
    (category: Category, checked: boolean) => {
      const nextParams = new URLSearchParams(searchParams);
      if (checked) {
        nextParams.append("category", category);
      } else {
        nextParams.delete("category", category);
      }
      nextParams.set("page", "1");
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalPages) {
        return;
      }
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("page", String(nextPage));
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams, totalPages],
  );

  const handleClearFilters = useCallback(() => {
    const nextParams = new URLSearchParams();
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }, [setSearchParams]);

  const handleClearDrawerFilters = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("park");
    nextParams.delete("sort");
    nextParams.delete("category");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  // const handleRetry = useCallback(() => {
  //   if (attractionsStatus === "error") {
  //     refetchAttractions();
  //   }
  //   if (parksStatus === "error") {
  //     refetchParks();
  //   }
  // }, [attractionsStatus, parksStatus, refetchAttractions, refetchParks]);

  const handleRetry = useCallback(() => {
    if (attractionsIsError) {
      refetchAttractions();
    }

    if (parksIsError) {
      refetchParks();
    }
  }, [attractionsIsError, parksIsError, refetchAttractions, refetchParks]);

  return (
    <>
      <div className={styles.page}>
        <AttractionFilters
          className={styles.desktopFilters}
          selectedPark={selectedPark}
          selectedSort={selectedSort}
          selectedCategories={selectedCategories}
          parks={parks}
          categoryOptions={CATEGORY_OPTIONS}
          onParkChange={handleParkChange}
          onSortChange={handleSortChange}
          onCategoryChange={handleCategoryChange}
        />

        <div className={styles.resultsArea}>
          <div className={styles.toolbar}>
            <span className={styles.resultCount}>{total} kết quả</span>

            <div className={styles.toolbarActions}>
              {hasActiveFilters && (
                <Button
                  className={styles.clearFiltersButton}
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Xóa tất cả
                </Button>
              )}

              <Button
                className={styles.filterButton}
                variant="secondary"
                size="sm"
                aria-haspopup="dialog"
                onClick={() => setIsFilterOpen(true)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 7h16M7 12h10M10 17h4" />
                </svg>
                Bộ lọc{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
              </Button>
            </div>
          </div>
          {(selectedPark || selectedCategories.length > 0) && (
            <div className={styles.chipRow}>
              <span className={styles.chipRowLabel}>Đang lọc:</span>

              {selectedPark && (
                <span className={styles.filterChip}>
                  {getParkName(selectedPark)}

                  <button
                    className={styles.removeChipButton}
                    type="button"
                    aria-label={`Bỏ lọc ${getParkName(selectedPark)}`}
                    onClick={() => handleParkChange("")}
                  >
                    <svg
                      width="14"
                      height="14"
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
                </span>
              )}

              {CATEGORY_OPTIONS.filter((option) =>
                selectedCategories.includes(option.value),
              ).map((option) => (
                <span className={styles.filterChip} key={option.value}>
                  {option.label}

                  <button
                    className={styles.removeChipButton}
                    type="button"
                    aria-label={`Bỏ lọc ${option.label}`}
                    onClick={() => handleCategoryChange(option.value, false)}
                  >
                    <svg
                      width="14"
                      height="14"
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
                </span>
              ))}
            </div>
          )}

          <AttractionListContent
            pageStatus={pageStatus}
            attractions={attractions}
            currentPage={currentPage}
            totalPages={totalPages}
            isUpdating={isPlaceholderData}
            getParkName={getParkName}
            onRetry={handleRetry}
            onClearFilters={handleClearFilters}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <Drawer
        open={isFilterOpen}
        title="Bộ lọc"
        placement="bottom"
        onClose={() => setIsFilterOpen(false)}
        footer={
          <>
            {hasActiveDrawerFilters && (
              <Button variant="ghost" onClick={handleClearDrawerFilters}>
                Xóa tất cả
              </Button>
            )}

            <Button onClick={() => setIsFilterOpen(false)}>
              Hiển thị {total} kết quả
            </Button>
          </>
        }
      >
        <AttractionFilters
          className={styles.drawerFilters}
          showTitle={false}
          sortGroupName="sort-mobile"
          selectedPark={selectedPark}
          selectedSort={selectedSort}
          selectedCategories={selectedCategories}
          parks={parks}
          categoryOptions={CATEGORY_OPTIONS}
          onParkChange={handleParkChange}
          onSortChange={handleSortChange}
          onCategoryChange={handleCategoryChange}
        />
      </Drawer>
    </>
  );
}
