'use client';

/**
 * siHutang — Page Header
 *
 * Consistent page header with back button and title.
 * ECC: touch-friendly back button, balanced heading text.
 */

import { useRouter } from 'next/navigation';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  readonly title: string;
  readonly showBack?: boolean;
  readonly rightAction?: React.ReactNode;
}

export default function PageHeader({
  title,
  showBack = false,
  rightAction,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {showBack ? (
          <button
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Kembali"
          >
            ←
          </button>
        ) : (
          <div className={styles.spacer} />
        )}
        <h1 className={styles.title}>{title}</h1>
        {rightAction ? (
          <div className={styles.rightAction}>{rightAction}</div>
        ) : (
          <div className={styles.spacer} />
        )}
      </div>
    </header>
  );
}
