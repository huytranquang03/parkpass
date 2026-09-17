import styles from "./Skeleton.module.css";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={`${styles.skeleton} ${className}`} />
  );
}
