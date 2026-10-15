import type { ComponentProps } from "react";
import styles from "./Button.module.css";

type ButtonVariant =
  "primary" | "secondary" | "ghost" | "danger" | "dangerSecondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  iconOnly = false,
  disabled = false,
  className = "",
  children,
  ...buttonProps
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    iconOnly ? styles.iconOnly : styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...buttonProps}
      type={type}
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {iconOnly && loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <>
          {loading && <span className={styles.spinner} aria-hidden="true" />}
          {children}
        </>
      )}
    </button>
  );
}
