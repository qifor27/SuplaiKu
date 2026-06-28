'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './detail.module.css';

interface Props {
  transactionId: string;
}

export default function DeleteTransactionButton({ transactionId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Hapus transaksi ini? Aksi ini tidak dapat dibatalkan dan akan merubah saldo hutang.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Gagal menghapus transaksi');
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
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={styles.deleteButton}
      title="Hapus Transaksi"
      type="button"
    >
      {isDeleting ? '⏳' : '🗑️'}
    </button>
  );
}
