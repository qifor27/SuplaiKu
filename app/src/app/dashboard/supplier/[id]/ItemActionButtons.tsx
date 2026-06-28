'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './detail.module.css';

interface Props {
  supplierId: string;
  itemId: string;
}

export default function ItemActionButtons({ supplierId, itemId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Hapus barang ini? Transaksi yang sudah terlanjur menggunakan barang ini tidak akan terhapus.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Gagal menghapus barang');
        return;
      }

      router.refresh();
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.itemActions}>
      <Link
        href={`/dashboard/supplier/${supplierId}/items/${itemId}/edit`}
        className={styles.itemEditButton}
        title="Edit Barang"
      >
        ✏️
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={styles.deleteButton}
        title="Hapus Barang"
        type="button"
      >
        {isDeleting ? '⏳' : '🗑️'}
      </button>
    </div>
  );
}
