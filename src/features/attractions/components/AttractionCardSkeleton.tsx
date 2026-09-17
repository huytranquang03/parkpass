import Skeleton from "@/components/ui/Skeleton";
import styles from "./AttractionCard.module.css";

export default function AttractionCardSkeleton() {
  return (
    <article className={styles.card} aria-hidden="true">
      <Skeleton className={styles.image} />

      <div className={styles.skeletonBody}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonText} />
        <Skeleton className={styles.skeletonTextShort} />
      </div>
    </article>
  );
}
