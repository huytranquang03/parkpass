import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import styles from "./AttractionSearch.module.css";

interface AttractionSearchProps {
  className?: string;
}

export default function AttractionSearch({
  className = "",
}: AttractionSearchProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchPending, startSearchTransition] = useTransition();

  const searchText =
    location.pathname === "/" ? (searchParams.get("q") ?? "") : "";

  const [searchDraft, setSearchDraft] = useState(searchText);
  const debouncedSearchDraft = useDebounce(searchDraft, 400);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastSyncedSearchRef = useRef(searchText);

  useEffect(() => {
    if (searchText === lastSyncedSearchRef.current) {
      return;
    }

    lastSyncedSearchRef.current = searchText;
    setSearchDraft(searchText);
  }, [searchText]);

  const handleSearchCommit = useCallback(
    (value: string) => {
      startSearchTransition(() => {
        if (location.pathname !== "/") {
          const nextParams = new URLSearchParams();

          if (value) {
            nextParams.set("q", value);
          }

          nextParams.set("page", "1");

          navigate({
            pathname: "/",
            search: nextParams.toString(),
          });

          return;
        }

        setSearchParams((currentParams) => {
          const nextParams = new URLSearchParams(currentParams);

          if (value) {
            nextParams.set("q", value);
          } else {
            nextParams.delete("q");
          }

          nextParams.set("page", "1");

          return nextParams;
        });
      });
    },
    [location.pathname, navigate, setSearchParams],
  );

  useEffect(() => {
    if (debouncedSearchDraft === lastSyncedSearchRef.current) {
      return;
    }

    lastSyncedSearchRef.current = debouncedSearchDraft;
    handleSearchCommit(debouncedSearchDraft);
  }, [debouncedSearchDraft, handleSearchCommit]);

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

  return (
    <label className={`${styles.searchBox} ${className}`}>
      <span className={styles.label}>Tìm attraction</span>

      <svg
        className={styles.icon}
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
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>

      <input
        className={styles.input}
        type="search"
        value={searchDraft}
        onChange={(event) => setSearchDraft(event.currentTarget.value)}
        placeholder="Tìm attraction, công viên..."
        ref={searchInputRef}
        aria-busy={isSearchPending}
      />

      <kbd className={styles.shortcut} aria-hidden="true">
        /
      </kbd>
    </label>
  );
}
