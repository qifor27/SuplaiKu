/**
 * siHutang — Settings Page
 *
 * Shows user info and logout option.
 * Owner-only: PIN change (future).
 */

import { auth, signOut } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import ChangePinForm from './ChangePinForm';
import styles from './settings.module.css';

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;
  const userRole = (user as { role?: string })?.role ?? 'EMPLOYEE';

  return (
    <>
      <PageHeader title="Pengaturan" />
      <div className={styles.pageContainer}>
        {/* User Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Akun</h2>
          <div className={styles.card}>
            <div className={styles.row}>
              <span className={styles.label}>Nama</span>
              <span className={styles.value}>{user?.name ?? 'User'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Role</span>
              <span
                className={`${styles.badge} ${
                  userRole === 'OWNER' ? 'badge-primary' : 'badge-warning'
                }`}
              >
                {userRole === 'OWNER' ? 'Owner' : 'Karyawan'}
              </span>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Aplikasi</h2>
          <div className={styles.card}>
            <div className={styles.row}>
              <span className={styles.label}>Versi</span>
              <span className={styles.value}>1.0.0</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>PWA</span>
              <span className={styles.value}>Aktif</span>
            </div>
          </div>
        </section>

        {/* Change PIN (Owner Only) */}
        {userRole === 'OWNER' && <ChangePinForm />}

        {/* Logout */}
        <section className={styles.section}>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button type="submit" className={styles.logoutButton}>
              Keluar
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
