/**
 * siHutang — Suppliers API
 *
 * GET /api/suppliers — List all suppliers with balances
 * POST /api/suppliers — Create new supplier
 *
 * ECC security-review: Zod validation, auth check, no data leaks
 * ECC prisma-patterns: cuid IDs, proper error handling
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { supplierSchema } from '@/lib/validators';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const suppliers = await prisma.supplier.findMany({
      include: {
        transactions: {
          select: { type: true, amount: true },
        },
        _count: { select: { items: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Compute balances (ECC immutability: pure map)
    const suppliersWithBalance = suppliers.map((supplier) => {
      const totalPurchase = supplier.transactions
        .filter((t) => t.type === 'PURCHASE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalPayment = supplier.transactions
        .filter((t) => t.type === 'PAYMENT')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // ECC immutability: return new object, not mutated
      const { transactions, ...supplierData } = supplier;
      return {
        ...supplierData,
        totalPurchase,
        totalPayment,
        balance: totalPurchase - totalPayment,
        itemCount: supplier._count.items,
      };
    });

    return NextResponse.json({
      success: true,
      data: suppliersWithBalance,
    });
  } catch (error) {
    // ECC error handling: log detail server-side, generic message to client
    console.error('GET /api/suppliers error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data supplier' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // ECC security: Zod validation at boundary
    const parsed = supplierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data tidak valid',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
      },
    });

    return NextResponse.json(
      { success: true, data: supplier },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/suppliers error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambah supplier' },
      { status: 500 }
    );
  }
}
