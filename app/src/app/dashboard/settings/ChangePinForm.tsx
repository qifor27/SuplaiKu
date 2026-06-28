'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { changePinSchema } from '@/lib/validators';
import styles from './settings.module.css';

export default function ChangePinForm() {
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setError(null);
    setSuccessMsg(null);

    // Client-side validation
    const parsed = changePinSchema.safeParse({ currentPin, newPin });
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      setError(firstError ?? 'Input tidak valid');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPin, newPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal mengubah PIN');
        return;
      }

      setSuccessMsg('PIN berhasil diubah. Mengeluarkan sesi...');
      setCurrentPin('');
      setNewPin('');
      
      // Auto logout after successful PIN change for security
      setTimeout(() => {
        signOut({ callbackUrl: '/login' });
      }, 1500);

    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Ubah PIN (Owner)</h2>
      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.row}>
            <label htmlFor="currentPin" className={styles.label}>
              PIN Saat Ini
            </label>
            <input
              id="currentPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              className={styles.input}
              placeholder="Masukkan PIN lama"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              disabled={isLoading || !!successMsg}
            />
          </div>
          <div className={styles.row}>
            <label htmlFor="newPin" className={styles.label}>
              PIN Baru
            </label>
            <input
              id="newPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              className={styles.input}
              placeholder="Masukkan 4-6 digit PIN baru"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              disabled={isLoading || !!successMsg}
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {successMsg && <div className={styles.successMessage}>{successMsg}</div>}

          <div className={styles.row}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isLoading || !currentPin || !newPin || !!successMsg}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan PIN Baru'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
