/**
 * siHutang — TypeScript type definitions
 *
 * ECC Coding Style: Organize by feature/domain, not by type.
 * All types in one focused file (<800 lines).
 */

/* ============================================
   Auth & User Types
   ============================================ */

export const ROLES = {
  OWNER: 'OWNER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface User {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SessionUser {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
}

/* ============================================
   Supplier Types
   ============================================ */

export interface Supplier {
  readonly id: string;
  readonly name: string;
  readonly phone: string | null;
  readonly address: string | null;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SupplierWithBalance extends Supplier {
  readonly totalPurchase: number;
  readonly totalPayment: number;
  readonly balance: number;
}

export interface SupplierDetail extends Supplier {
  readonly items: readonly Item[];
  readonly transactions: readonly Transaction[];
  readonly totalPurchase: number;
  readonly totalPayment: number;
  readonly balance: number;
}

/* ============================================
   Item Types
   ============================================ */

export interface Item {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly pricePerUnit: number;
  readonly supplierId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ItemWithSupplier extends Item {
  readonly supplier: Supplier;
}

/* ============================================
   Transaction Types
   ============================================ */

export const TRANSACTION_TYPES = {
  PURCHASE: 'PURCHASE',
  PAYMENT: 'PAYMENT',
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export interface Transaction {
  readonly id: string;
  readonly type: TransactionType;
  readonly amount: number;
  readonly quantity: number | null;
  readonly description: string | null;
  readonly method: string | null;
  readonly date: Date;
  readonly supplierId: string;
  readonly itemId: string | null;
  readonly createdAt: Date;
}

export interface TransactionWithRelations extends Transaction {
  readonly supplier: Supplier;
  readonly item: Item | null;
}

/* ============================================
   Dashboard / Report Types
   ============================================ */

export interface DashboardSummary {
  readonly totalDebt: number;
  readonly totalPurchase: number;
  readonly totalPayment: number;
  readonly supplierCount: number;
  readonly supplierDebts: readonly SupplierDebtSummary[];
  readonly recentTransactions: readonly TransactionWithRelations[];
}

export interface SupplierDebtSummary {
  readonly supplierId: string;
  readonly supplierName: string;
  readonly totalPurchase: number;
  readonly totalPayment: number;
  readonly balance: number;
}

export interface ReportFilter {
  readonly supplierId?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly type?: TransactionType;
}

export interface ReportData {
  readonly transactions: readonly TransactionWithRelations[];
  readonly summary: {
    readonly totalPurchase: number;
    readonly totalPayment: number;
    readonly netBalance: number;
  };
  readonly filter: ReportFilter;
}

/* ============================================
   API Response Types
   ============================================ */

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

/* ============================================
   Form Input Types
   ============================================ */

export interface SupplierInput {
  readonly name: string;
  readonly phone?: string;
  readonly address?: string;
  readonly notes?: string;
}

export interface ItemInput {
  readonly name: string;
  readonly unit: string;
  readonly pricePerUnit: number;
  readonly supplierId: string;
}

export interface TransactionInput {
  readonly type: TransactionType;
  readonly amount: number;
  readonly quantity?: number;
  readonly description?: string;
  readonly method?: string;
  readonly date?: string;
  readonly supplierId: string;
  readonly itemId?: string;
}

export interface LoginInput {
  readonly role: Role;
  readonly pin: string;
}

/* ============================================
   Payment Methods
   ============================================ */

export const PAYMENT_METHODS = [
  'Tunai',
  'Transfer BCA',
  'Transfer BRI',
  'Transfer Mandiri',
  'Transfer BNI',
  'QRIS',
  'Lainnya',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/* ============================================
   Units
   ============================================ */

export const ITEM_UNITS = [
  'kg',
  'gram',
  'liter',
  'ml',
  'pcs',
  'lusin',
  'rim',
  'karton',
  'box',
  'sak',
  'roll',
  'meter',
  'lembar',
] as const;

export type ItemUnit = (typeof ITEM_UNITS)[number];
