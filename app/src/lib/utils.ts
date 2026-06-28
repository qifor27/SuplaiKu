/**
 * siHutang — Utility Functions
 *
 * ECC Coding Style:
 * - Functions <50 lines
 * - Immutability: never mutate, return new values
 * - Readable, well-named identifiers
 */

/**
 * Format number to Indonesian Rupiah currency string.
 * Uses tabular-nums compatible format.
 *
 * @example formatRupiah(1500000) → "Rp 1.500.000"
 * @example formatRupiah(-500000) → "-Rp 500.000"
 */
export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absoluteAmount);

  return `${isNegative ? '-' : ''}Rp ${formatted}`;
}

/**
 * Format number with + or - prefix for transaction display.
 *
 * @example formatTransactionAmount(1500000, 'PURCHASE') → "+Rp 1.500.000"
 * @example formatTransactionAmount(500000, 'PAYMENT') → "-Rp 500.000"
 */
export function formatTransactionAmount(
  amount: number,
  type: 'PURCHASE' | 'PAYMENT'
): string {
  const prefix = type === 'PURCHASE' ? '+' : '-';
  const formatted = formatRupiah(Math.abs(amount));
  return `${prefix}${formatted}`;
}

/**
 * Format date to Indonesian locale string.
 *
 * @example formatDate(new Date()) → "27 Jun 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date to short format for tables.
 *
 * @example formatDateShort(new Date()) → "27/06"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Format date to full Indonesian format.
 *
 * @example formatDateFull(new Date()) → "Jumat, 27 Juni 2026"
 */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 jam lalu", "kemarin").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDate(d);
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalize first letter of each word.
 *
 * @example capitalize("pt sumber makmur") → "Pt Sumber Makmur"
 */
export function capitalize(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Generate initials from name (max 2 characters).
 *
 * @example getInitials("PT Sumber Makmur") → "PS"
 * @example getInitials("Berkah") → "BE"
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/**
 * Parse a number string with Indonesian formatting (dots as thousands separator).
 *
 * @example parseRupiahInput("1.500.000") → 1500000
 */
export function parseRupiahInput(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Format input value as rupiah while typing.
 *
 * @example formatRupiahInput("1500000") → "1.500.000"
 */
export function formatRupiahInput(value: string): string {
  const number = parseRupiahInput(value);
  if (number === 0) return '';
  return new Intl.NumberFormat('id-ID').format(number);
}

/**
 * Classnames helper — concatenate CSS class strings.
 * Filters out falsy values.
 *
 * @example cn('base', isActive && 'active', isError && 'error')
 */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Debounce function — delay execution until pause in calls.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get today's date as ISO string (date only, no time).
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a role has permission for a given action.
 */
export function hasPermission(
  role: 'OWNER' | 'EMPLOYEE',
  action: 'delete' | 'edit' | 'export' | 'settings'
): boolean {
  if (role === 'OWNER') return true;
  return false; // Employee cannot delete, edit supplier, export, or change settings
}
