import Skeleton from "@/components/ui/Skeleton";
import styles from "./RouteLoadingFallback.module.css";

export default function RouteLoadingFallback() {
  return (
    <section className={styles.page} role="status" aria-label="Đang tải trang">
      <Skeleton className={styles.title} />
      <Skeleton className={styles.line} />
      <Skeleton className={styles.panel} />
    </section>
  );
}
