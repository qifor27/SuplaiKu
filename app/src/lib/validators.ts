/**
 * siHutang — Zod Validation Schemas
 *
 * ECC Security: Validate all user input at system boundaries.
 * Use schema-based validation. Fail fast with clear messages.
 * Never trust external data.
 */

import { z } from 'zod';

/* ============================================
   Auth Validators
   ============================================ */

export const loginSchema = z.object({
  role: z.enum(['OWNER', 'EMPLOYEE'], { message: 'Role tidak valid' }),
  pin: z
    .string({ message: 'PIN wajib diisi' })
    .min(4, 'PIN minimal 4 digit')
    .max(6, 'PIN maksimal 6 digit')
    .regex(/^\d+$/, 'PIN hanya boleh berisi angka'),
});

export const changePinSchema = z.object({
  currentPin: z
    .string({ message: 'PIN lama wajib diisi' })
    .min(4, 'PIN minimal 4 digit')
    .max(6, 'PIN maksimal 6 digit')
    .regex(/^\d+$/, 'PIN hanya boleh berisi angka'),
  newPin: z
    .string({ message: 'PIN baru wajib diisi' })
    .min(4, 'PIN minimal 4 digit')
    .max(6, 'PIN maksimal 6 digit')
    .regex(/^\d+$/, 'PIN hanya boleh berisi angka'),
});

/* ============================================
   Supplier Validators
   ============================================ */

export const supplierSchema = z.object({
  name: z
    .string({ message: 'Nama supplier wajib diisi' })
    .min(1, 'Nama supplier wajib diisi')
    .max(100, 'Nama supplier maksimal 100 karakter')
    .trim(),
  phone: z
    .string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .regex(/^[\d\s+\-()]*$/, 'Format nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .optional()
    .or(z.literal('')),
});

/* ============================================
   Item Validators
   ============================================ */

export const itemSchema = z.object({
  name: z
    .string({ message: 'Nama barang wajib diisi' })
    .min(1, 'Nama barang wajib diisi')
    .max(200, 'Nama barang maksimal 200 karakter')
    .trim(),
  unit: z
    .string({ message: 'Satuan wajib diisi' })
    .min(1, 'Satuan wajib diisi')
    .max(20, 'Satuan maksimal 20 karakter')
    .trim(),
  pricePerUnit: z
    .number({ message: 'Harga satuan wajib diisi' })
    .positive('Harga satuan harus lebih dari 0')
    .max(999_999_999_999, 'Harga satuan terlalu besar'),
  supplierId: z
    .string({ message: 'Supplier wajib dipilih' })
    .min(1, 'Supplier wajib dipilih'),
});

/* ============================================
   Transaction Validators
   ============================================ */

export const transactionSchema = z.object({
  type: z.enum(['PURCHASE', 'PAYMENT'], {
    message: 'Jenis transaksi tidak valid',
  }),
  amount: z
    .number({ message: 'Jumlah wajib diisi' })
    .positive('Jumlah harus lebih dari 0')
    .max(9_999_999_999_999, 'Jumlah terlalu besar'),
  quantity: z
    .number()
    .int('Kuantitas harus bilangan bulat')
    .positive('Kuantitas harus lebih dari 0')
    .optional(),
  description: z
    .string()
    .max(500, 'Keterangan maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  method: z
    .string()
    .max(50, 'Metode pembayaran maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .datetime({ message: 'Format tanggal tidak valid' })
    .optional(),
  supplierId: z
    .string({ message: 'Supplier wajib dipilih' })
    .min(1, 'Supplier wajib dipilih'),
  itemId: z.string().optional().or(z.literal('')),
});

/* ============================================
   Report Filter Validators
   ============================================ */

export const reportFilterSchema = z.object({
  supplierId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['PURCHASE', 'PAYMENT']).optional(),
});

/* ============================================
   ID Parameter Validators
   ============================================ */

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID tidak valid'),
});

/* ============================================
   Type Exports (inferred from schemas)
   ============================================ */

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePinInput = z.infer<typeof changePinSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
