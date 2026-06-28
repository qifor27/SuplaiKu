/**
 * siHutang — Supplier Detail Loading Skeleton
 * 
 * ECC react-performance: Instant feedback boundary for the heaviest page in the app.
 */

import styles from '../../loading.module.css';

export default function SupplierDetailLoading() {
  return (
    <div className={styles.container}>
      {/* Profile Header Skeleton */}
      <div className={`${styles.pulse} ${styles.title}`} style={{ width: '70%' }} />
      
      {/* Debt Balance Card Skeleton */}
      <div className={`${styles.pulse} ${styles.card}`} style={{ height: '110px' }} />
      
      {/* Contact Info Skeleton */}
      <div className={`${styles.pulse} ${styles.sectionTitle}`} style={{ width: '20%' }} />
      <div className={`${styles.pulse} ${styles.card}`} style={{ height: '90px' }} />
      
      {/* Transaction & Items List Skeleton */}
      <div className={`${styles.pulse} ${styles.sectionTitle}`} style={{ width: '40%' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className={`${styles.pulse} ${styles.row}`} />
        <div className={`${styles.pulse} ${styles.row}`} />
        <div className={`${styles.pulse} ${styles.row}`} />
        <div className={`${styles.pulse} ${styles.row}`} />
      </div>
    </div>
  );
}
