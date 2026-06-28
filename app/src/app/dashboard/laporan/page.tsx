/**
 * siHutang — Laporan (Reports) Page
 *
 * Shows debt summary per supplier and transaction history.
 * ECC dashboard-builder: "answer real questions, not vanity metrics"
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatRupiah, formatDate, formatTransactionAmount } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import styles from './laporan.module.css';

export default async function LaporanPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role ?? 'EMPLOYEE';

  // Get all suppliers with balances
  const suppliers = await prisma.supplier.findMany({
    include: {
      transactions: {
        select: { type: true, amount: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const supplierSummaries = suppliers.map((supplier) => {
    const totalPurchase = supplier.transactions
      .filter((t) => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPayment = supplier.transactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      id: supplier.id,
      name: supplier.name,
      totalPurchase,
      totalPayment,
      balance: totalPurchase - totalPayment,
    };
  });

  // Recent transactions (last 30)
  const recentTransactions = await prisma.transaction.findMany({
    include: {
      supplier: { select: { name: true } },
      item: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
    take: 30,
  });

  const grandTotalPurchase = supplierSummaries.reduce((s, sup) => s + sup.totalPurchase, 0);
  const grandTotalPayment = supplierSummaries.reduce((s, sup) => s + sup.totalPayment, 0);
  const grandTotalDebt = grandTotalPurchase - grandTotalPayment;

  return (
    <>
      <PageHeader title="Laporan" />
      <div className={styles.pageContainer}>
        {/* Grand Totals */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Total Keseluruhan</h2>
          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <span>Total Hutang</span>
              <span className={`mono-num ${styles.debt}`}>
                {formatRupiah(grandTotalDebt)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total Belanja</span>
              <span className="mono-num">{formatRupiah(grandTotalPurchase)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total Bayar</span>
              <span className={`mono-num ${styles.payment}`}>
                {formatRupiah(grandTotalPayment)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Jumlah Supplier</span>
              <span>{suppliers.length}</span>
            </div>
          </div>
        </section>

        {/* Per-Supplier Table */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Rekap per Supplier</h2>
          <div className={styles.fullTable}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thName}>Supplier</th>
                    <th className={styles.thNum}>Belanja</th>
                    <th className={styles.thNum}>Bayar</th>
                    <th className={styles.thNum}>Sisa</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierSummaries.map((sup) => (
                    <tr key={sup.id}>
                      <td className={styles.tdName}>{sup.name}</td>
                      <td className={`${styles.tdNum} mono-num`}>
                        {formatRupiah(sup.totalPurchase)}
                      </td>
                      <td className={`${styles.tdNum} mono-num ${styles.payment}`}>
                        {formatRupiah(sup.totalPayment)}
                      </td>
                      <td className={`${styles.tdNum} mono-num ${sup.balance > 0 ? styles.debt : styles.payment}`}>
                        {sup.balance > 0 ? formatRupiah(sup.balance) : 'Lunas'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Transaction Log */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Riwayat Transaksi (30 terakhir)
          </h2>
          <div className={styles.fullTable}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thDate}>Tanggal</th>
                    <th className={styles.thName}>Supplier</th>
                    <th className={styles.thType}>Jenis</th>
                    <th className={styles.thNum}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className={`${styles.tdDate} mono-num`}>
                        {formatDate(txn.date)}
                      </td>
                      <td className={styles.tdName}>{txn.supplier.name}</td>
                      <td className={styles.tdType}>
                        <span
                          className={`${styles.typeBadge} ${
                            txn.type === 'PURCHASE'
                              ? styles.badgePurchase
                              : styles.badgePayment
                          }`}
                        >
                          {txn.type === 'PURCHASE' ? 'Beli' : 'Bayar'}
                        </span>
                      </td>
                      <td
                        className={`${styles.tdNum} mono-num ${
                          txn.type === 'PURCHASE' ? styles.debt : styles.payment
                        }`}
                      >
                        {formatTransactionAmount(Number(txn.amount), txn.type)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
