import type {
  AttractionListResponse,
  Category,
  CategoryOption,
  Park,
} from "../types";
import styles from "./AttractionListPage.module.css";
import { useRef } from "react";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useFetch, type FetchStatus } from "@/hooks/useFetch";
import AttractionListHeader from "./AttractionListHeader";
import AttractionFilters from "./AttractionFilters";
import AttractionListContent from "./AttractionListContent";

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
      <AttractionListHeader />
      <AttractionFilters
        searchText={searchText}
        selectedPark={selectedPark}
        selectedSort={selectedSort}
        selectedCategories={selectedCategories}
        parks={parks}
        categoryOptions={CATEGORY_OPTIONS}
        searchInputRef={searchInputRef}
        onSearchChange={handleSearchChange}
        onParkChange={handleParkChange}
        onSortChange={handleSortChange}
        onCategoryChange={handleCategoryChange}
      />
      <AttractionListContent
        pageStatus={pageStatus}
        attractions={attractions}
        pageError={pageError}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        getParkName={getParkName}
        onRetry={handleRetry}
        onClearFilters={handleClearFilters}
        onPageChange={handlePageChange}
      />
    </section>
  );
}
