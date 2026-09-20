import { useEffect, type ReactNode } from "react";
import styles from "./Drawer.module.css";

interface DrawerProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Drawer({
  open,
  title,
  children,
  onClose,
}: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Đóng giỏ hàng"
        onClick={onClose}
      />

      <section
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.header}>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng giỏ hàng">
            ×
          </button>
        </header>

        {children}
      </section>
    </div>
  );
}
