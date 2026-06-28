'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './detail.module.css';

interface Props {
  supplierId: string;
}

export default function DeleteSupplierButton({ supplierId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Double confirmation to prevent accidental cascading deletes
    const confirm1 = window.confirm('Hapus supplier ini?');
    if (!confirm1) return;

    const confirm2 = window.confirm(
      'PERINGATAN KERAS: Menghapus supplier ini akan MENGHAPUS SEMUA BARANG dan RIWAYAT TRANSAKSI yang terkait secara PERMANEN. Lanjutkan?'
    );
    if (!confirm2) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Gagal menghapus supplier');
        setIsDeleting(false);
        return;
      }

      // Redirect to supplier list
      router.push('/dashboard/supplier');
      router.refresh();
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={styles.deleteSupplierButton}
      title="Hapus Supplier"
      type="button"
    >
      {isDeleting ? 'Menghapus...' : 'Hapus Supplier'}
    </button>
  );
}
