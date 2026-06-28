'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { supplierSchema } from '@/lib/validators';
// We reuse the CSS from the "New Supplier" page for UI consistency
import styles from '@/app/dashboard/supplier/new/new.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSupplierPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/suppliers/${id}`);
        const result = await res.json();
        
        if (!res.ok) {
          setError(result.error || 'Gagal memuat data supplier');
          return;
        }

        setFormData({
          name: result.data.name || '',
          phone: result.data.phone || '',
          address: result.data.address || '',
          notes: result.data.notes || '',
        });
      } catch (err) {
        setError('Kesalahan jaringan saat memuat data');
      } finally {
        setIsFetching(false);
      }
    }
    
    loadData();
  }, [id]);

  const handleChange = useCallback(
    (field: string, value: string) => {
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
        const response = await fetch(`/api/suppliers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? 'Gagal mengubah supplier');
          return;
        }

        router.push(`/dashboard/supplier/${id}`);
        router.refresh();
      } catch {
        setError('Terjadi kesalahan jaringan. Coba lagi.');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, id, router]
  );

  if (isFetching) {
    return (
      <>
        <PageHeader title="Edit Supplier" showBack />
        <div className={styles.formContainer} style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Memuat data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Edit Supplier" showBack />
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
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isLoading}
              required
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
            {isLoading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </>
  );
}
