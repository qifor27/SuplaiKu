/**
 * siHutang — Supplier List Page (Server Component)
 *
 * Shows all suppliers with search, debt balance, and links to detail.
 * ECC dashboard-builder: answer "who do I owe?" at a glance.
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatRupiah } from '@/lib/utils';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import styles from './supplier.module.css';

export default async function SupplierListPage() {
  const [session, suppliers] = await Promise.all([
    auth(),
    prisma.supplier.findMany({
      include: {
        transactions: {
          select: { type: true, amount: true },
        },
        _count: { select: { items: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const userRole = (session?.user as { role?: string })?.role ?? 'EMPLOYEE';

  const suppliersWithBalance = suppliers.map((supplier) => {
    const totalPurchase = supplier.transactions
      .filter((t) => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPayment = supplier.transactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      balance: totalPurchase - totalPayment,
      itemCount: supplier._count.items,
    };
  });

  return (
    <>
      <PageHeader
        title="Supplier"
        rightAction={
          <Link href="/dashboard/supplier/new" className={styles.addButton}>
            + Tambah
          </Link>
        }
      />
      <div className={styles.pageContainer}>
        {suppliersWithBalance.length > 0 ? (
          <div className={styles.supplierList}>
            {suppliersWithBalance.map((supplier) => (
              <Link
                key={supplier.id}
                href={`/dashboard/supplier/${supplier.id}`}
                className={styles.supplierCard}
              >
                <div className={styles.supplierInfo}>
                  <div className={styles.supplierInitial}>
                    {supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.supplierText}>
                    <span className={styles.supplierName}>{supplier.name}</span>
                    <span className={styles.supplierMeta}>
                      {supplier.phone || 'Tanpa telepon'} · {supplier.itemCount} barang
                    </span>
                  </div>
                </div>
                <div className={styles.supplierBalance}>
                  {supplier.balance > 0 ? (
                    <span className={styles.balanceDebt}>
                      {formatRupiah(supplier.balance)}
                    </span>
                  ) : (
                    <span className={styles.balanceClear}>Lunas</span>
                  )}
                  <span className={styles.chevron}>›</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>👥</span>
            <p className={styles.emptyTitle}>Belum ada supplier</p>
            <p className={styles.emptyText}>
              Tambah supplier pertama Anda untuk mulai mencatat hutang.
            </p>
            <Link href="/dashboard/supplier/new" className={styles.emptyButton}>
              + Tambah Supplier
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
