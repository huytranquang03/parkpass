import { useId, type ComponentPropsWithRef } from "react";
import styles from "./Field.module.css";

interface FieldProps extends ComponentPropsWithRef<"input"> {
  label: string;
  error?: string;
  helperText?: string;
  loading?: boolean;
}

export default function Field({
  id,
  label,
  error,
  helperText,
  loading = false,
  className = "",
  ...inputProps
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const message = error ?? helperText;
  const messageId = message ? `${inputId}-message` : undefined;

  const describedBy =
    [inputProps["aria-describedby"], messageId].filter(Boolean).join(" ") ||
    undefined;

  const inputClassNames = [
    styles.input,
    error && styles.inputError,
    loading && styles.inputLoading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>

      <div className={styles.control}>
        <input
          {...inputProps}
          id={inputId}
          className={inputClassNames}
          aria-invalid={error ? true : inputProps["aria-invalid"]}
          aria-describedby={describedBy}
          aria-busy={loading || undefined}
        />

        {loading && <span className={styles.spinner} aria-hidden="true" />}
      </div>

      {message && (
        <p className={error ? styles.error : styles.helper} id={messageId}>
          {message}
        </p>
      )}
    </div>
  );
}
