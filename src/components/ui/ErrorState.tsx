import type { ReactNode } from "react";
import styles from "./FeedbackState.module.css";

interface ErrorStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function ErrorState({
  title,
  description,
  action,
}: ErrorStateProps) {
  return (
    <section className={styles.state} role="alert">
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M12 3 2.5 20h19L12 3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>

      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}
