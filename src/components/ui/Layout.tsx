import type { ReactNode } from "react";
import styles from "./Layout.module.css";

interface LayoutProps {
  header: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}

export default function Layout({ header, aside, children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>{header}</header>

      <div className={styles.body}>
        {aside && <aside className={styles.aside}>{aside}</aside>}

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
