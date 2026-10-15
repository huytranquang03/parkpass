// import { createPortal } from "react-dom";
// import styles from "./Toast.module.css";

// interface ToastProps {
//   message: string;
// }

// export default function Toast({ message }: ToastProps) {
//   return createPortal(
//     <div className={styles.toast} role="status" aria-atomic="true">
//       {message}
//     </div>,
//     document.body,
//   );
// }

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  variant = "success",
  duration = 4000,
  onClose,
}: ToastProps) {
  const timeoutRef = useRef<number | null>(null);
  const remainingTimeRef = useRef(duration);
  const startedAtRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();

    startedAtRef.current = Date.now();

    timeoutRef.current = window.setTimeout(() => {
      onClose();
    }, remainingTimeRef.current);
  }, [clearTimer, onClose]);

  useEffect(() => {
    remainingTimeRef.current = duration;
    startTimer();

    return clearTimer;
  }, [clearTimer, duration, message, startTimer]);

  function handlePauseTimer() {
    if (timeoutRef.current === null) return;

    const elapsedTime = Date.now() - startedAtRef.current;

    remainingTimeRef.current = Math.max(
      0,
      remainingTimeRef.current - elapsedTime,
    );

    clearTimer();
  }

  function handleResumeTimer() {
    if (remainingTimeRef.current <= 0) {
      onClose();
      return;
    }

    startTimer();
  }

  const classNames = [styles.toast, styles[variant]].join(" ");

  return createPortal(
    <div
      className={classNames}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      onMouseEnter={handlePauseTimer}
      onMouseLeave={handleResumeTimer}
      onFocus={handlePauseTimer}
      onBlur={handleResumeTimer}
    >
      <span className={styles.icon} aria-hidden="true">
        {variant === "success" ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m8 12 3 3 5-6" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        )}
      </span>

      <p className={styles.message}>{message}</p>

      <button
        type="button"
        className={styles.closeButton}
        aria-label="Đóng thông báo"
        onClick={onClose}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>,
    document.body,
  );
}
