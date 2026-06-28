'use client';

/**
 * siHutang — New Transaction Form
 *
 * Records purchases (hutang bertambah) or payments (hutang berkurang).
 * This is the most frequently used page for daily operations.
 *
 * ECC make-interfaces-feel-better: Large touch targets, mobile keyboard
 * ECC frontend-patterns: Controlled form, error boundaries
 * ECC security: Zod validation, no hardcoded values
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { transactionSchema } from '@/lib/validators';
import { formatRupiahInput, parseRupiahInput } from '@/lib/utils';
import type { TransactionType } from '@/types';
import styles from './new.module.css';

interface SupplierOption {
  readonly id: string;
  readonly name: string;
}

interface ItemOption {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly pricePerUnit: string | number;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);

  const [formData, setFormData] = useState({
    type: '' as TransactionType | '',
    supplierId: '',
    itemId: '',
    amountDisplay: '',
    quantity: '',
    description: '',
    method: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch suppliers on mount
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const res = await fetch('/api/suppliers');
        const data = await res.json();
        if (data.success) {
          setSuppliers(data.data);
        }
      } catch {
        console.error('Failed to fetch suppliers');
      }
    }
    fetchSuppliers();
  }, []);

  // Fetch items when supplier changes
  useEffect(() => {
    async function fetchItems() {
      if (!formData.supplierId) {
        setItems([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/items?supplierId=${formData.supplierId}`
        );
        const data = await res.json();
        if (data.success) {
          setItems(data.data);
        }
      } catch {
        console.error('Failed to fetch items');
      }
    }
    fetchItems();
  }, [formData.supplierId]);

  // Auto-calculate amount when item + quantity changes
  useEffect(() => {
    if (formData.itemId && formData.quantity) {
      const selectedItem = items.find((i) => i.id === formData.itemId);
      if (selectedItem) {
        const price = Number(selectedItem.pricePerUnit);
        const qty = parseInt(formData.quantity, 10) || 0;
        const total = price * qty;
        if (total > 0) {
          setFormData((prev) => ({
            ...prev,
            amountDisplay: formatRupiahInput(total.toString()),
          }));
        }
      }
    }
  }, [formData.itemId, formData.quantity, items]);

  const handleChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    []
  );

  const handleAmountChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      amountDisplay: formatRupiahInput(value),
    }));
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const amount = parseRupiahInput(formData.amountDisplay);

      const submitData = {
        type: formData.type,
        supplierId: formData.supplierId,
        itemId: formData.itemId || undefined,
        amount,
        quantity: formData.quantity
          ? parseInt(formData.quantity, 10)
          : undefined,
        description: formData.description || undefined,
        method: formData.method || undefined,
        date: formData.date
          ? new Date(formData.date).toISOString()
          : undefined,
      };

      // Client-side validation
      const parsed = transactionSchema.safeParse(submitData);
      if (!parsed.success) {
        const firstError = Object.values(
          parsed.error.flatten().fieldErrors
        )[0]?.[0];
        setError(firstError ?? 'Data tidak valid');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? 'Gagal mencatat transaksi');
          return;
        }

        router.push('/dashboard');
        router.refresh();
      } catch {
        setError('Terjadi kesalahan jaringan. Coba lagi.');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, router]
  );

  // Auto-generate description
  useEffect(() => {
    if (formData.type === 'PURCHASE' && formData.itemId && formData.quantity) {
      const selectedItem = items.find((i) => i.id === formData.itemId);
      if (selectedItem) {
        const desc = `${selectedItem.name} ${formData.quantity}${selectedItem.unit}`;
        setFormData((prev) => ({ ...prev, description: desc }));
      }
    }
  }, [formData.type, formData.itemId, formData.quantity, items]);

  return (
    <>
      <PageHeader title="Catat Transaksi" showBack />
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Transaction Type */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Jenis Transaksi <span className={styles.required}>*</span>
            </label>
            <div className={styles.typeSelector}>
              <button
                type="button"
                className={styles.typeButton}
                data-active={formData.type === 'PURCHASE'}
                data-type="PURCHASE"
                onClick={() => handleChange('type', 'PURCHASE')}
              >
                <span className={styles.typeIcon}>📦</span>
                Pembelian
              </button>
              <button
                type="button"
                className={styles.typeButton}
                data-active={formData.type === 'PAYMENT'}
                data-type="PAYMENT"
                onClick={() => handleChange('type', 'PAYMENT')}
              >
                <span className={styles.typeIcon}>💰</span>
                Pembayaran
              </button>
            </div>
          </div>

          {/* Supplier */}
          <div className={styles.fieldGroup}>
            <label htmlFor="supplierId" className={styles.label}>
              Supplier <span className={styles.required}>*</span>
            </label>
            <select
              id="supplierId"
              className={styles.select}
              value={formData.supplierId}
              onChange={(e) => handleChange('supplierId', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Pilih supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item (only for PURCHASE) */}
          {formData.type === 'PURCHASE' && formData.supplierId && (
            <div className={styles.fieldGroup}>
              <label htmlFor="itemId" className={styles.label}>
                Barang
              </label>
              <select
                id="itemId"
                className={styles.select}
                value={formData.itemId}
                onChange={(e) => handleChange('itemId', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Pilih barang (opsional)...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit}) - Rp{' '}
                    {Number(item.pricePerUnit).toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity (only if item selected) */}
          {formData.type === 'PURCHASE' && formData.itemId && (
            <div className={styles.fieldGroup}>
              <label htmlFor="quantity" className={styles.label}>
                Jumlah
              </label>
              <input
                id="quantity"
                type="number"
                inputMode="numeric"
                className={styles.input}
                placeholder="Contoh: 50"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                disabled={isLoading}
                min="1"
              />
            </div>
          )}

          {/* Amount */}
          <div className={styles.fieldGroup}>
            <label htmlFor="amount" className={styles.label}>
              Jumlah (Rp) <span className={styles.required}>*</span>
            </label>
            <div className={styles.rupiahInputGroup}>
              <span className={styles.rupiahPrefix}>Rp</span>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                className={styles.rupiahInput}
                placeholder="1.500.000"
                value={formData.amountDisplay}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Payment Method (only for PAYMENT) */}
          {formData.type === 'PAYMENT' && (
            <div className={styles.fieldGroup}>
              <label htmlFor="method" className={styles.label}>
                Metode Pembayaran
              </label>
              <select
                id="method"
                className={styles.select}
                value={formData.method}
                onChange={(e) => handleChange('method', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Pilih metode...</option>
                <option value="Tunai">Tunai</option>
                <option value="Transfer BCA">Transfer BCA</option>
                <option value="Transfer BRI">Transfer BRI</option>
                <option value="Transfer Mandiri">Transfer Mandiri</option>
                <option value="Transfer BNI">Transfer BNI</option>
                <option value="QRIS">QRIS</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          )}

          {/* Date */}
          <div className={styles.fieldGroup}>
            <label htmlFor="date" className={styles.label}>
              Tanggal
            </label>
            <input
              id="date"
              type="date"
              className={styles.input}
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label htmlFor="description" className={styles.label}>
              Keterangan
            </label>
            <input
              id="description"
              type="text"
              className={styles.input}
              placeholder={
                formData.type === 'PURCHASE'
                  ? 'Otomatis terisi jika pilih barang'
                  : 'Contoh: Angsuran ke-2'
              }
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !formData.type || !formData.supplierId}
          >
            {isLoading
              ? 'Menyimpan...'
              : formData.type === 'PURCHASE'
                ? '📦 Catat Pembelian'
                : formData.type === 'PAYMENT'
                  ? '💰 Catat Pembayaran'
                  : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </>
  );
}
