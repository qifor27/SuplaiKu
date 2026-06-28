'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { itemSchema } from '@/lib/validators';
import styles from '@/app/dashboard/supplier/[id]/items/new/new-item.module.css';

interface PageProps {
  params: Promise<{ id: string; itemId: string }>;
}

export default function EditItemPage({ params }: PageProps) {
  const router = useRouter();
  const { id: supplierId, itemId } = use(params);
  
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    pricePerUnit: '',
  });

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/items/${itemId}`);
        const result = await res.json();
        
        if (!res.ok) {
          setError(result.error || 'Gagal memuat data barang');
          return;
        }

        setFormData({
          name: result.data.name || '',
          unit: result.data.unit || '',
          pricePerUnit: result.data.pricePerUnit ? String(result.data.pricePerUnit) : '',
        });
      } catch (err) {
        setError('Kesalahan jaringan saat memuat data');
      } finally {
        setIsFetching(false);
      }
    }
    
    loadData();
  }, [itemId]);

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
        const response = await fetch(`/api/items/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? 'Gagal mengubah barang');
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
    [formData, supplierId, itemId, router]
  );

  if (isFetching) {
    return (
      <>
        <PageHeader title="Edit Barang" showBack />
        <div className={styles.formContainer} style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Memuat data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Edit Barang" showBack />
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
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoComplete="off"
              disabled={isLoading}
              required
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
            {isLoading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </>
  );
}
