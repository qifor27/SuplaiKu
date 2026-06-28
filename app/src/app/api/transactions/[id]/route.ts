/**
 * siHutang — Single Transaction API
 *
 * DELETE /api/transactions/[id] — Delete transaction (Owner only)
 *
 * ECC security: Owner-only delete, generic error messages
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
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
        { success: false, error: 'Hanya Owner yang dapat menghapus transaksi' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus',
    });
  } catch (error) {
    console.error('DELETE /api/transactions/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus transaksi' },
      { status: 500 }
    );
  }
}
