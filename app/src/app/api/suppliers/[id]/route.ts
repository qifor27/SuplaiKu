/**
 * siHutang — Single Supplier API
 *
 * GET /api/suppliers/[id] — Get supplier detail with items, transactions, balance
 * PUT /api/suppliers/[id] — Update supplier (Owner only)
 * DELETE /api/suppliers/[id] — Delete supplier (Owner only)
 *
 * ECC security: Role-based access, Zod validation, no data leaks
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { supplierSchema } from '@/lib/validators';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        items: { orderBy: { name: 'asc' } },
        transactions: {
          include: {
            item: { select: { name: true, unit: true } },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    // Compute balance
    const totalPurchase = supplier.transactions
      .filter((t) => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPayment = supplier.transactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      success: true,
      data: {
        ...supplier,
        totalPurchase,
        totalPayment,
        balance: totalPurchase - totalPayment,
      },
    });
  } catch (error) {
    console.error('GET /api/suppliers/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat detail supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ECC security: Owner-only action
    const role = (session.user as { role: string }).role;
    if (role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Hanya Owner yang dapat mengedit supplier' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

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

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error('PUT /api/suppliers/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengubah supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ECC security: Owner-only action
    const role = (session.user as { role: string }).role;
    if (role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Hanya Owner yang dapat menghapus supplier' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.supplier.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil dihapus',
    });
  } catch (error) {
    console.error('DELETE /api/suppliers/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus supplier' },
      { status: 500 }
    );
  }
}
