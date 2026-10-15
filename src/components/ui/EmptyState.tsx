import type { ReactNode } from "react";
import styles from "./FeedbackState.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <section className={styles.state}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
        <path d="M8 11h6" />
      </svg>

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>

      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}
