/**
 * siHutang — Global Dashboard Loading Skeleton
 * 
 * ECC react-performance: Provides instant navigation feedback while Server Components
 * resolve their data-fetching promises.
 */

import styles from './loading.module.css';

export default function DashboardLoading() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={`${styles.pulse} ${styles.title}`} />
      
      {/* Summary / Hero Card Skeleton */}
      <div className={`${styles.pulse} ${styles.card}`} />
      
      {/* Sub-section Skeleton */}
      <div className={`${styles.pulse} ${styles.sectionTitle}`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className={`${styles.pulse} ${styles.row}`} />
        <div className={`${styles.pulse} ${styles.row}`} />
        <div className={`${styles.pulse} ${styles.row}`} />
        <div className={`${styles.pulse} ${styles.row}`} />
      </div>
    </div>
  );
}
