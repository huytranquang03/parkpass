import { useState, type ComponentProps } from "react";
import styles from "./ImageWithFallback.module.css";

interface ImageWithFallbackProps extends ComponentProps<"img"> {
  alt: string;
  fallbackClassName?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  onError,
  ...imageProps
}: ImageWithFallbackProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const hasError = !src || failedSource === src;

  if (hasError) {
    const fallbackLabel = alt ? `Không tải được ảnh ${alt}` : undefined;

    return (
      <span
        className={`${styles.fallback} ${fallbackClassName}`}
        role={fallbackLabel ? "img" : undefined}
        aria-label={fallbackLabel}
        aria-hidden={fallbackLabel ? undefined : true}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 16-5-5-8 8" />
          <path d="m4 4 16 16" />
        </svg>
      </span>
    );
  }

  return (
    <img
      {...imageProps}
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailedSource(src);
        onError?.(event);
      }}
    />
  );
}
