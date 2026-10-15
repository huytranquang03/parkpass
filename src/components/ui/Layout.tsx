import type { ReactNode } from "react";
import styles from "./Layout.module.css";

interface LayoutProps {
  header: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  compactHeaderOnMobile?: boolean;
  searchHeaderOnMobile?: boolean;
}

export default function Layout({
  header,
  aside,
  children,
  compactHeaderOnMobile = false,
  searchHeaderOnMobile = false,
}: LayoutProps) {
  const headerClassName = [
    styles.header,
    compactHeaderOnMobile ? styles.compactHeader : "",
    searchHeaderOnMobile ? styles.searchHeader : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.layout}>
      <header className={headerClassName}>{header}</header>

      <div className={styles.body}>
        {aside && <aside className={styles.aside}>{aside}</aside>}

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
