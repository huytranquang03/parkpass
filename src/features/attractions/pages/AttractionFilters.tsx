import { memo } from "react";
import type { Category, CategoryOption, Park } from "../types";
import styles from "./AttractionListPage.module.css";

interface AttractionFiltersProps {
  className?: string;
  showTitle?: boolean;
  sortGroupName?: string;
  selectedPark: string;
  selectedSort: string;
  selectedCategories: string[];
  parks: Park[];
  categoryOptions: CategoryOption[];
  onParkChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onCategoryChange: (category: Category, checked: boolean) => void;
}

function AttractionFilters({
  className = "",
  showTitle = true,
  sortGroupName = "sort",
  selectedPark,
  selectedSort,
  selectedCategories,
  parks,
  categoryOptions,
  onParkChange,
  onSortChange,
  onCategoryChange,
}: AttractionFiltersProps) {
  return (
    <aside
      className={`${styles.filterSidebar} ${className}`}
      aria-label="Bộ lọc"
    >
      {showTitle && <h2 className={styles.filterTitle}>Bộ lọc</h2>}
      <label className={styles.filterField}>
        <span className={styles.filterLabel}>Công viên</span>

        <span className={styles.selectControl}>
          <select
            className={styles.filterSelect}
            value={selectedPark}
            onChange={(event) => onParkChange(event.currentTarget.value)}
          >
            <option value="">Tất cả công viên</option>

            {parks.map((park) => (
              <option key={park.id} value={park.id}>
                {park.name}
              </option>
            ))}
          </select>

          <svg
            className={styles.selectChevron}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </label>
      <fieldset className={styles.filterGroup}>
        <legend className={styles.filterLegend}>Loại hình</legend>

        {categoryOptions.map((option) => (
          <label className={styles.filterOption} key={option.value}>
            <input
              className={styles.filterCheckbox}
              type="checkbox"
              checked={selectedCategories.includes(option.value)}
              onChange={(event) =>
                onCategoryChange(option.value, event.currentTarget.checked)
              }
            />

            {option.label}
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.filterGroup}>
        <legend className={styles.filterLegend}>Sắp xếp</legend>

        <label className={styles.filterOption}>
          <input
            className={styles.filterRadio}
            type="radio"
            name={sortGroupName}
            checked={selectedSort === ""}
            onChange={() => onSortChange("")}
          />
          Phổ biến nhất
        </label>

        <label className={styles.filterOption}>
          <input
            className={styles.filterRadio}
            type="radio"
            name={sortGroupName}
            checked={selectedSort === "price_asc"}
            onChange={() => onSortChange("price_asc")}
          />
          Giá thấp đến cao
        </label>

        <label className={styles.filterOption}>
          <input
            className={styles.filterRadio}
            type="radio"
            name={sortGroupName}
            checked={selectedSort === "price_desc"}
            onChange={() => onSortChange("price_desc")}
          />
          Giá cao đến thấp
        </label>

        <label className={styles.filterOption}>
          <input
            className={styles.filterRadio}
            type="radio"
            name={sortGroupName}
            checked={selectedSort === "rating_desc"}
            onChange={() => onSortChange("rating_desc")}
          />
          Đánh giá cao nhất
        </label>
      </fieldset>
    </aside>
  );
}

export default memo(AttractionFilters);
