'use client';

/**
 * siHutang — Mobile Bottom Navigation
 *
 * ECC make-interfaces-feel-better:
 * - Thumb-zone friendly (bottom of screen)
 * - Hit areas minimum 44x44px
 * - Familiar pattern (Instagram, WhatsApp, Tokopedia)
 * - Active state with indicator line
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SessionUser } from '@/types';
import styles from './MobileNav.module.css';

interface NavItem {
  readonly href: string;
  readonly icon: string;
  readonly label: string;
  readonly isAdd?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', icon: '🏠', label: 'Beranda' },
  { href: '/dashboard/supplier', icon: '👥', label: 'Supplier' },
  { href: '/dashboard/transaksi/new', icon: '➕', label: 'Baru', isAdd: true },
  { href: '/dashboard/laporan', icon: '📊', label: 'Laporan' },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Lainnya' },
];

interface MobileNavProps {
  readonly user: SessionUser;
}

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} role="navigation" aria-label="Menu utama">
      <div className={styles.navInner}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={item.isAdd ? styles.navItemAdd : styles.navItem}
              data-active={isActive}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
