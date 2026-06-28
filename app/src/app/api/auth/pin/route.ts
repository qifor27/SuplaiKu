/**
 * siHutang — Change PIN API
 *
 * PUT /api/auth/pin — Change user PIN
 *
 * ECC security: Auth check, Owner-only, Zod validation, Bcrypt verification
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { changePinSchema } from '@/lib/validators';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Protect: Only Owner can change PIN currently (as per requirements)
    const role = (session.user as { role: string }).role;
    if (role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Hanya Owner yang dapat mengubah PIN' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const parsed = changePinSchema.safeParse(body);
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

    const { currentPin, newPin } = parsed.data;

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify current PIN
    const isValidPin = await bcrypt.compare(currentPin, user.pin);
    if (!isValidPin) {
      return NextResponse.json(
        { success: false, error: 'PIN saat ini salah' },
        { status: 400 }
      );
    }

    // Hash new PIN and update
    const newPinHash = await bcrypt.hash(newPin, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { pin: newPinHash },
    });

    return NextResponse.json({
      success: true,
      message: 'PIN berhasil diubah',
    });
  } catch (error) {
    console.error('PUT /api/auth/pin error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat mengubah PIN' },
      { status: 500 }
    );
  }
}
