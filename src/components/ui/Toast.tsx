import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return createPortal(
    <div className={styles.toast} role="status" aria-atomic="true">
      {message}
    </div>,
    document.body,
  );
}
