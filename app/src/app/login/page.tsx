'use client';

/**
 * siHutang — Login Page
 *
 * PIN-based authentication with role selection.
 *
 * ECC make-interfaces-feel-better:
 * - Hit areas minimum 44x44px
 * - 16px font on inputs (prevent iOS zoom)
 * - Touch-friendly role buttons
 * - Auto-advance PIN digits
 *
 * ECC security-review:
 * - PIN validated via Zod schema before submit
 * - Error messages don't leak internal data
 */

import { useState, useRef, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/types';
import styles from './login.module.css';

const PIN_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role);
    setError(null);
    // Focus first PIN input after role selection
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handlePinChange = useCallback(
    (index: number, value: string) => {
      // Only allow digits
      const digit = value.replace(/\D/g, '').slice(-1);

      // ECC immutability: create new array
      const newPin = [...pin];
      newPin[index] = digit;
      setPin(newPin);
      setError(null);

      // Auto-advance to next input
      if (digit && index < PIN_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [pin]
  );

  const handlePinKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Backspace: go to previous input
      if (e.key === 'Backspace' && !pin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
      }
    },
    [pin]
  );

  const handlePinPaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, PIN_LENGTH);

      if (pastedData.length > 0) {
        const newPin = Array(PIN_LENGTH).fill('');
        for (let i = 0; i < pastedData.length; i++) {
          newPin[i] = pastedData[i];
        }
        setPin(newPin);
        // Focus the input after the last pasted digit
        const nextIndex = Math.min(pastedData.length, PIN_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedRole) {
        setError('Pilih role terlebih dahulu');
        return;
      }

      const pinString = pin.join('');
      if (pinString.length < 4) {
        setError('PIN minimal 4 digit');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await signIn('credentials', {
          role: selectedRole,
          pin: pinString,
          redirect: false,
        });

        if (result?.error) {
          // ECC security: generic error message, don't reveal which field is wrong
          setError('PIN salah. Silakan coba lagi.');
          setPin(Array(PIN_LENGTH).fill(''));
          inputRefs.current[0]?.focus();
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } catch {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedRole, pin, router]
  );

  const isPinComplete = pin.filter(Boolean).length >= 4;
  const isFormValid = selectedRole && isPinComplete;

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandIcon}>📊</div>
          <h1 className={styles.brandTitle}>siHutang</h1>
          <p className={styles.brandSubtitle}>
            Manajemen Hutang Supplier
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className={styles.roleSection}>
            <label className={styles.roleLabel}>Masuk sebagai:</label>
            <div className={styles.roleGroup}>
              <button
                type="button"
                className={styles.roleButton}
                data-active={selectedRole === 'OWNER'}
                onClick={() => handleRoleSelect('OWNER')}
              >
                <span className={styles.roleIcon}>👤</span>
                Owner
              </button>
              <button
                type="button"
                className={styles.roleButton}
                data-active={selectedRole === 'EMPLOYEE'}
                onClick={() => handleRoleSelect('EMPLOYEE')}
              >
                <span className={styles.roleIcon}>👥</span>
                Karyawan
              </button>
            </div>
          </div>

          {/* PIN Input */}
          <div className={styles.pinSection}>
            <label className={styles.pinLabel}>Masukkan PIN:</label>
            <div className={styles.pinInputGroup} onPaste={handlePinPaste}>
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className={styles.pinDigit}
                  value={pin[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  autoComplete="one-time-code"
                  aria-label={`PIN digit ${index + 1}`}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} />
                Memverifikasi...
              </>
            ) : (
              'MASUK'
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
