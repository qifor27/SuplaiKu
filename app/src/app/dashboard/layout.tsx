/**
 * siHutang — Dashboard Layout
 *
 * Wraps all /dashboard/* pages with:
 * - Auth check (redirect to login if not authenticated)
 * - Bottom tab navigation (MobileNav)
 * - Offline banner (PWA)
 * - Safe area padding for mobile
 *
 * ECC: Server component for auth check, client components for interactive UI.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import MobileNav from '@/components/layout/MobileNav';
import OfflineBanner from '@/components/layout/OfflineBanner';
import styles from './dashboard.module.css';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = {
    id: session.user.id,
    name: session.user.name ?? 'User',
    role: (session.user as { role: string }).role as 'OWNER' | 'EMPLOYEE',
  };

  return (
    <div className={styles.dashboardContainer}>
      <OfflineBanner />
      <main className={styles.mainContent}>{children}</main>
      <MobileNav user={user} />
    </div>
  );
}
