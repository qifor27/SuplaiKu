'use client';

/**
 * siHutang — Add Item Form
 *
 * ECC frontend-patterns: Form handling with controlled inputs
 * ECC make-interfaces-feel-better: 16px font inputs, 44px touch targets
 * ECC security: Zod validation before submit
 */

import { useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { itemSchema } from '@/lib/validators';
import styles from './new-item.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewItemPage({ params }: PageProps) {
  const router = useRouter();
  const { id: supplierId } = use(params);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convert price string for input handling, but store as string in state
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    pricePerUnit: '',
  });

  const handleChange = useCallback(
    (field: string, value: string) => {
      // ECC immutability: create new object
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const price = parseFloat(formData.pricePerUnit);

      const payload = {
        name: formData.name,
        unit: formData.unit,
        pricePerUnit: isNaN(price) ? 0 : price,
        supplierId,
      };

      // Client-side validation
      const parsed = itemSchema.safeParse(payload);
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
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? 'Gagal menambah barang');
          return;
        }

        router.push(`/dashboard/supplier/${supplierId}`);
        router.refresh();
      } catch {
        setError('Terjadi kesalahan jaringan. Coba lagi.');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, supplierId, router]
  );

  return (
    <>
      <PageHeader title="Tambah Barang" showBack />
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="name" className={styles.label}>
              Nama Barang <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="Contoh: Gula Pasir"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label htmlFor="pricePerUnit" className={styles.label}>
                Harga Satuan <span className={styles.required}>*</span>
              </label>
              <div className={styles.rupiahInputGroup}>
                <span className={styles.rupiahPrefix}>Rp</span>
                <input
                  id="pricePerUnit"
                  type="number"
                  inputMode="numeric"
                  className={styles.rupiahInput}
                  placeholder="0"
                  value={formData.pricePerUnit}
                  onChange={(e) => handleChange('pricePerUnit', e.target.value)}
                  min="0"
                  step="1"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="unit" className={styles.label}>
                Satuan <span className={styles.required}>*</span>
              </label>
              <input
                id="unit"
                type="text"
                className={styles.input}
                placeholder="Contoh: kg, karung"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !formData.name.trim() || !formData.unit.trim() || !formData.pricePerUnit}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Barang'}
          </button>
        </form>
      </div>
    </>
  );
}
