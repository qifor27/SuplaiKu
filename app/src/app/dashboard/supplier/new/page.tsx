'use client';

/**
 * siHutang — Add Supplier Form
 *
 * ECC frontend-patterns: Form handling with controlled inputs
 * ECC make-interfaces-feel-better: 16px font inputs, 44px touch targets
 * ECC security: Zod validation before submit
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { supplierSchema } from '@/lib/validators';
import styles from './new.module.css';

export default function NewSupplierPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
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

      // Client-side validation
      const parsed = supplierSchema.safeParse(formData);
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
        const response = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? 'Gagal menambah supplier');
          return;
        }

        router.push('/dashboard/supplier');
        router.refresh();
      } catch {
        setError('Terjadi kesalahan jaringan. Coba lagi.');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, router]
  );

  return (
    <>
      <PageHeader title="Tambah Supplier" showBack />
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="name" className={styles.label}>
              Nama Supplier <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="Contoh: PT Sumber Makmur"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="phone" className={styles.label}>
              No. Telepon
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              className={styles.input}
              placeholder="Contoh: 0812-3456-7890"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="address" className={styles.label}>
              Alamat
            </label>
            <textarea
              id="address"
              className={styles.textarea}
              placeholder="Contoh: Jl. Industri No. 15, Jakarta"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="notes" className={styles.label}>
              Catatan
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              placeholder="Contoh: Supplier gula dan tepung"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
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
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Supplier'}
          </button>
        </form>
      </div>
    </>
  );
}
