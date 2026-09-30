import { memo, useEffect, useRef, useState, type RefObject } from "react";
import type { Category, CategoryOption, Park } from "../types";
import styles from "./AttractionListPage.module.css";
import { useDebounce } from "@/hooks/useDebounce";

interface AttractionFiltersProps {
  searchText: string;
  selectedPark: string;
  selectedSort: string;
  selectedCategories: string[];
  parks: Park[];
  categoryOptions: CategoryOption[];
  searchInputRef: RefObject<HTMLInputElement | null>;
  onParkChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (category: Category, checked: boolean) => void;
  onSearchCommit: (value: string) => void;
  isSearchPending: boolean;
}

function AttractionFilters({
  searchText,
  selectedPark,
  selectedSort,
  selectedCategories,
  parks,
  categoryOptions,
  searchInputRef,
  onParkChange,
  onSortChange,
  onCategoryChange,
  onSearchCommit,
  isSearchPending,
}: AttractionFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(searchText);
  const debouncedSearchDraft = useDebounce(searchDraft, 400);

  const lastSyncedSearchRef = useRef(searchText);

  useEffect(() => {
    if (searchText === lastSyncedSearchRef.current) {
      return;
    }

    lastSyncedSearchRef.current = searchText;
    setSearchDraft(searchText);
  }, [searchText]);

  useEffect(() => {
    if (debouncedSearchDraft === lastSyncedSearchRef.current) {
      return;
    }

    lastSyncedSearchRef.current = debouncedSearchDraft;
    onSearchCommit(debouncedSearchDraft);
  }, [debouncedSearchDraft, onSearchCommit]);
  return (
    <>
      <label htmlFor="attraction-search">Tìm kiếm trải nghiệm</label>
      <input
        className={styles.input}
        id="attraction-search"
        type="search"
        value={searchDraft}
        onChange={(e) => setSearchDraft(e.currentTarget.value)}
        placeholder="Nhập tên trải nghiệm"
        ref={searchInputRef}
        aria-busy={isSearchPending}
      />
      <label htmlFor="park-filter">Khu vui chơi</label>
      <select
        id="park-filter"
        value={selectedPark}
        onChange={(e) => onParkChange(e.currentTarget.value)}
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
        onChange={(e) => onSortChange(e.currentTarget.value)}
      >
        <option value="">Mặc định</option>
        <option value="price_asc">Giá thấp đến cao</option>
        <option value="price_desc">Giá cao đến thấp</option>
        <option value="rating_desc">Rating cao nhất</option>
      </select>
      <fieldset className={styles.filterGroup}>
        <legend>Danh mục</legend>
        {categoryOptions.map((option) => (
          <label key={option.value}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(option.value)}
              onChange={(e) =>
                onCategoryChange(option.value, e.currentTarget.checked)
              }
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    </>
  );
}

export default memo(AttractionFilters);
