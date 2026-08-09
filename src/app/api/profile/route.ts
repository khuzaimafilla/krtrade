import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/profile — fetch current user's profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      tradingStyle: true,
      initialBalance: true,
      accountCurrency: true,
      bio: true,
      isOnboarded: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// PATCH /api/profile — update profile fields
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    username,
    tradingStyle,
    initialBalance,
    accountCurrency,
    bio,
    name,
    isOnboarded,
  } = body;

  // Validate username uniqueness if being set
  if (username) {
    const existing = await prisma.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Username sudah digunakan. Pilih username lain.' },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(username && { username }),
      ...(tradingStyle && { tradingStyle }),
      ...(initialBalance !== undefined && { initialBalance: Number(initialBalance) }),
      ...(accountCurrency && { accountCurrency }),
      ...(bio !== undefined && { bio }),
      ...(name && { name }),
      ...(isOnboarded !== undefined && { isOnboarded: Boolean(isOnboarded) }),
    },
    select: {
      id: true,
      username: true,
      tradingStyle: true,
      initialBalance: true,
      accountCurrency: true,
      bio: true,
      isOnboarded: true,
    },
  });

  return NextResponse.json({ user: updated });
}
