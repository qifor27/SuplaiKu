/**
 * siHutang — Supplier Detail Page
 *
 * Shows supplier info, items, transaction history, and balance.
 * ECC dashboard-builder: answer "what's my position with this supplier?"
 */

import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatRupiah, formatDate, formatTransactionAmount } from '@/lib/utils';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import DeleteTransactionButton from './DeleteTransactionButton';
import DeleteSupplierButton from './DeleteSupplierButton';
import ItemActionButtons from './ItemActionButtons';
import styles from './detail.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [session, supplier] = await Promise.all([
    auth(),
    prisma.supplier.findUnique({
      where: { id },
      include: {
        items: { orderBy: { name: 'asc' } },
        transactions: {
          include: {
            item: { select: { name: true, unit: true } },
          },
          orderBy: { date: 'desc' },
        },
      },
    }),
  ]);

  const userRole = (session?.user as { role?: string })?.role ?? 'EMPLOYEE';

  if (!supplier) {
    notFound();
  }

  const totalPurchase = supplier.transactions
    .filter((t) => t.type === 'PURCHASE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPayment = supplier.transactions
    .filter((t) => t.type === 'PAYMENT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalPurchase - totalPayment;

  const headerAction = userRole === 'OWNER' ? (
    <div className={styles.headerActions}>
      <Link href={`/dashboard/supplier/${supplier.id}/edit`} className={styles.editSupplierButton}>
        ✏️ Edit
      </Link>
      <DeleteSupplierButton supplierId={supplier.id} />
    </div>
  ) : undefined;

  return (
    <>
      <PageHeader title={supplier.name} showBack rightAction={headerAction} />
      <div className={styles.pageContainer}>
        {/* Balance Summary */}
        <div className={styles.balanceCard}>
          <div className={styles.balanceRow}>
            <span className={styles.balanceLabel}>Sisa Hutang</span>
            <span className={`${styles.balanceValue} ${balance > 0 ? styles.debt : styles.clear}`}>
              {balance > 0 ? formatRupiah(balance) : 'Lunas'}
            </span>
          </div>
          <div className={styles.balanceBreakdown}>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>Total Belanja</span>
              <span className={styles.breakdownValue}>
                {formatRupiah(totalPurchase)}
              </span>
            </div>
            <div className={styles.breakdownDivider} />
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>Total Bayar</span>
              <span className={`${styles.breakdownValue} ${styles.paymentValue}`}>
                {formatRupiah(totalPayment)}
              </span>
            </div>
          </div>
        </div>

        {/* Supplier Info */}
        {(supplier.phone || supplier.address || supplier.notes) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Info</h2>
            <div className={styles.infoCard}>
              {supplier.phone && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>📞 Telepon</span>
                  <a href={`tel:${supplier.phone}`} className={styles.infoValue}>
                    {supplier.phone}
                  </a>
                </div>
              )}
              {supplier.address && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>📍 Alamat</span>
                  <span className={styles.infoValue}>{supplier.address}</span>
                </div>
              )}
              {supplier.notes && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>📝 Catatan</span>
                  <span className={styles.infoValue}>{supplier.notes}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Items List */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Daftar Barang ({supplier.items.length})
            </h2>
            <Link 
              href={`/dashboard/supplier/${supplier.id}/items/new`}
              className={styles.txnDate} /* reusing small gray style or just custom inline style, let's use a simple style */
              style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, fontSize: 'var(--text-sm)' }}
            >
              + Tambah
            </Link>
          </div>
          {supplier.items.length > 0 ? (
            <div className={styles.itemsList}>
              {supplier.items.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>
                      {formatRupiah(Number(item.pricePerUnit))}/{item.unit}
                    </span>
                  </div>
                  {userRole === 'OWNER' && (
                    <ItemActionButtons supplierId={supplier.id} itemId={item.id} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Belum ada barang tercatat.</p>
          )}
        </section>

        {/* Transaction History */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Riwayat Transaksi ({supplier.transactions.length})
          </h2>
          {supplier.transactions.length > 0 ? (
            <div className={styles.transactionList}>
              {supplier.transactions.map((txn) => (
                <div key={txn.id} className={styles.txnRow}>
                  <div className={styles.txnLeft}>
                    <span className={`${styles.txnBadge} ${txn.type === 'PURCHASE' ? styles.txnPurchase : styles.txnPayment}`}>
                      {txn.type === 'PURCHASE' ? '📦' : '💰'}
                    </span>
                    <div className={styles.txnInfo}>
                      <span className={styles.txnDesc}>
                        {txn.description || (txn.type === 'PURCHASE' ? 'Pembelian' : 'Pembayaran')}
                      </span>
                      <span className={styles.txnDate}>
                        {formatDate(txn.date)}
                        {txn.method && ` · ${txn.method}`}
                      </span>
                    </div>
                  </div>
                  <div className={styles.txnRight}>
                    <span className={`${styles.txnAmount} ${txn.type === 'PURCHASE' ? styles.txnAmountPurchase : styles.txnAmountPayment}`}>
                      {formatTransactionAmount(Number(txn.amount), txn.type)}
                    </span>
                    {userRole === 'OWNER' && (
                      <DeleteTransactionButton transactionId={txn.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Belum ada transaksi.</p>
          )}
        </section>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Link
            href={`/dashboard/transaksi/new?supplierId=${supplier.id}`}
            className={styles.actionButton}
          >
            ➕ Catat Transaksi
          </Link>
        </div>
      </div>
    </>
  );
}
