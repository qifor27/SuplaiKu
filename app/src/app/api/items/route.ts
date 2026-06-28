/**
 * siHutang — Items API
 *
 * GET /api/items — List items (optionally filter by supplierId)
 * POST /api/items — Create new item
 *
 * ECC security: Auth check, Zod validation
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { itemSchema } from '@/lib/validators';

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

    const items = await prisma.item.findMany({
      where: supplierId ? { supplierId } : undefined,
      include: {
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('GET /api/items error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data barang' },
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

    const item = await prisma.item.create({
      data: {
        name: parsed.data.name,
        unit: parsed.data.unit,
        pricePerUnit: parsed.data.pricePerUnit,
        supplierId: parsed.data.supplierId,
      },
    });

    return NextResponse.json(
      { success: true, data: item },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/items error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambah barang' },
      { status: 500 }
    );
  }
}
