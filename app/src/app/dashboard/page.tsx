/**
 * siHutang — Dashboard Page (Server Component)
 *
 * Spreadsheet-style summary showing:
 * 1. Total debt, purchases, payments
 * 2. Debt per supplier
 * 3. Recent transactions
 *
 * ECC dashboard-builder: "Start from operator questions, not visual layout"
 * Questions answered: How much do I owe? To whom? What happened recently?
 *
 * ECC prisma-patterns: Saldo = SUM(PURCHASE) - SUM(PAYMENT), computed runtime
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatRupiah, formatDateShort, formatTransactionAmount } from '@/lib/utils';
import Link from 'next/link';
import styles from './page.module.css';

async function getDashboardData() {
  // Fetch everything in parallel
  const [suppliers, recentTransactions] = await Promise.all([
    prisma.supplier.findMany({
      include: {
        transactions: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.transaction.findMany({
      include: {
        supplier: { select: { name: true } },
        item: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    }),
  ]);

  // Compute per-supplier balances (ECC immutability: pure computation)
  const supplierDebts = suppliers.map((supplier) => {
    const totalPurchase = supplier.transactions
      .filter((t) => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPayment = supplier.transactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      totalPurchase,
      totalPayment,
      balance: totalPurchase - totalPayment,
    };
  });

  // Compute totals
  const totalPurchase = supplierDebts.reduce((sum, s) => sum + s.totalPurchase, 0);
  const totalPayment = supplierDebts.reduce((sum, s) => sum + s.totalPayment, 0);
  const totalDebt = totalPurchase - totalPayment;

  return {
    totalDebt,
    totalPurchase,
    totalPayment,
    supplierCount: suppliers.length,
    supplierDebts: supplierDebts.filter((s) => s.balance > 0),
    recentTransactions,
  };
}

export default async function DashboardPage() {
  const [session, dataResult] = await Promise.all([
    auth(),
    getDashboardData()
      .then((data) => ({ ok: true as const, data }))
      .catch(() => ({ ok: false as const })),
  ]);

  const userRole = (session?.user as { role?: string })?.role ?? 'EMPLOYEE';
  const userName = session?.user?.name ?? 'User';

  if (!dataResult.ok) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.greeting}>
          <h1 className={styles.greetingTitle}>Halo, {userName}!</h1>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>⚠️</span>
          <p className={styles.emptyText}>
            Gagal memuat data. Periksa koneksi database Anda.
          </p>
        </div>
      </div>
    );
  }

  const data = dataResult.data;

  return (
    <div className={styles.pageContainer}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>Halo, {userName}!</h1>
        <p className={styles.greetingSubtitle}>
          <span
            className={`${styles.roleBadge} ${
              userRole === 'OWNER' ? 'badge-primary' : 'badge-warning'
            }`}
          >
            {userRole === 'OWNER' ? '👤 Owner' : '👥 Karyawan'}
          </span>
        </p>
      </div>

      {/* Summary Table — spreadsheet style */}
      <section className={styles.summarySection}>
        <h2 className={styles.sectionTitle}>Ringkasan</h2>
        <div className={styles.summaryTable}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total Hutang</span>
            <span className={`${styles.summaryValue} ${styles.debt}`}>
              {formatRupiah(data.totalDebt)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total Belanja</span>
            <span className={`${styles.summaryValue} ${styles.purchase}`}>
              {formatRupiah(data.totalPurchase)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total Bayar</span>
            <span className={`${styles.summaryValue} ${styles.payment}`}>
              {formatRupiah(data.totalPayment)}
            </span>
          </div>
        </div>
      </section>

      {/* Supplier Debts Table */}
      <section className={styles.summarySection}>
        <h2 className={styles.sectionTitle}>
          Hutang per Supplier ({data.supplierDebts.length})
        </h2>
        {data.supplierDebts.length > 0 ? (
          <div className={styles.supplierTable}>
            <div className={styles.supplierTableHeader}>
              <span className={styles.colName}>Supplier</span>
              <span className={styles.colAmount}>Sisa Hutang</span>
            </div>
            {data.supplierDebts.map((supplier) => (
              <Link
                key={supplier.supplierId}
                href={`/dashboard/supplier/${supplier.supplierId}`}
                className={styles.supplierRow}
              >
                <span className={styles.colName}>
                  {supplier.supplierName}
                </span>
                <span className={styles.colAmount}>
                  {formatRupiah(supplier.balance)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎉</span>
            <p className={styles.emptyText}>
              Tidak ada hutang. Semua lunas!
            </p>
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section className={styles.summarySection}>
        <h2 className={styles.sectionTitle}>
          Transaksi Terakhir
        </h2>
        {data.recentTransactions.length > 0 ? (
          <div className={styles.supplierTable}>
            <div className={styles.supplierTableHeader}>
              <span className={styles.txnDate}>Tgl</span>
              <span className={styles.colName}>Supplier</span>
              <span className={styles.colAmount}>Jumlah</span>
            </div>
            {data.recentTransactions.map((txn) => (
              <div key={txn.id} className={styles.transactionRow}>
                <span className={styles.txnDate}>
                  {formatDateShort(txn.date)}
                </span>
                <span className={styles.txnSupplier}>
                  {txn.supplier.name}
                </span>
                <span
                  className={`${styles.txnAmount} ${
                    txn.type === 'PURCHASE' ? styles.purchase : styles.payment
                  }`}
                >
                  {formatTransactionAmount(Number(txn.amount), txn.type)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📝</span>
            <p className={styles.emptyText}>
              Belum ada transaksi. Mulai catat pembelian pertama Anda.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
