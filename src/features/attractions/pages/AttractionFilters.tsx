import type { RefObject } from "react";
import type { Category, CategoryOption, Park } from "../types";
import styles from "./AttractionListPage.module.css";

interface AttractionFiltersProps {
  searchText: string;
  selectedPark: string;
  selectedSort: string;
  selectedCategories: string[];
  parks: Park[];
  categoryOptions: CategoryOption[];
  searchInputRef: RefObject<HTMLInputElement | null>;
  onSearchChange: (value: string) => void;
  onParkChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (category: Category, checked: boolean) => void;
}

export default function AttractionFilters({
  searchText,
  selectedPark,
  selectedSort,
  selectedCategories,
  parks,
  categoryOptions,
  searchInputRef,
  onSearchChange,
  onParkChange,
  onSortChange,
  onCategoryChange,
}: AttractionFiltersProps) {
  return (
    <>
      <label htmlFor="attraction-search">Tìm kiếm trải nghiệm</label>
      <input
        className={styles.input}
        id="attraction-search"
        type="search"
        value={searchText}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        placeholder="Nhập tên trải nghiệm"
        ref={searchInputRef}
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
