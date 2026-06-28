/**
 * siHutang — Single Item API
 *
 * PUT /api/items/[id] — Update item (Owner only)
 * DELETE /api/items/[id] — Delete item (Owner only)
 *
 * ECC security: Auth check, Owner-only, Zod validation
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { itemSchema } from '@/lib/validators';

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

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('GET /api/items/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat detail barang' },
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

    // Protect: Owner only
    const role = (session.user as { role: string }).role;
    if (role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Hanya Owner yang dapat mengubah barang' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const parsed = itemSchema.safeParse(body);
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

    // Verify item exists
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        name: parsed.data.name,
        unit: parsed.data.unit,
        pricePerUnit: parsed.data.pricePerUnit,
        // we can ignore supplierId change here unless we want to move items between suppliers
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('PUT /api/items/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengubah barang' },
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

    // Protect: Owner only
    const role = (session.user as { role: string }).role;
    if (role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Hanya Owner yang dapat menghapus barang' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify item exists
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete item (Prisma schema has onDelete: SetNull for transactions, so transactions won't be deleted)
    await prisma.item.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Barang berhasil dihapus',
    });
  } catch (error) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus barang' },
      { status: 500 }
    );
  }
}
