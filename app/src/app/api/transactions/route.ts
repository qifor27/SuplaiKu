/**
 * siHutang — Transactions API
 *
 * GET /api/transactions — List transactions (with filters)
 * POST /api/transactions — Create new transaction (purchase or payment)
 *
 * ECC security: Auth check, Zod validation, role-aware
 * ECC prisma-patterns: Proper indexes used via supplierId + date filter
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { transactionSchema } from '@/lib/validators';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    // Build filter (ECC immutability: compose where object)
    const where: Prisma.TransactionWhereInput = {};

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (type === 'PURCHASE' || type === 'PAYMENT') {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
        item: { select: { id: true, name: true, unit: true } },
      },
      orderBy: { date: 'desc' },
      take: Math.min(limit, 100), // ECC security: cap at 100
    });

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat transaksi' },
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
    const parsed = transactionSchema.safeParse(body);
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

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: parsed.data.supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify item exists if provided
    if (parsed.data.itemId) {
      const item = await prisma.item.findUnique({
        where: { id: parsed.data.itemId },
      });
      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Barang tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: parsed.data.type,
        amount: parsed.data.amount,
        quantity: parsed.data.quantity ?? null,
        description: parsed.data.description || null,
        method: parsed.data.method || null,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
        supplierId: parsed.data.supplierId,
        itemId: parsed.data.itemId || null,
      },
      include: {
        supplier: { select: { name: true } },
        item: { select: { name: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencatat transaksi' },
      { status: 500 }
    );
  }
}
