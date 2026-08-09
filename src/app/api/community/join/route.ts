import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || code.trim().length !== 6) {
      return NextResponse.json({ error: 'Kode grup tidak valid (harus 6 digit)' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { code: code.trim() },
      include: {
        members: true
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup tidak ditemukan' }, { status: 404 });
    }

    const isAlreadyMember = group.members.some(m => m.userId === session.user.id);
    if (isAlreadyMember) {
      return NextResponse.json({ error: 'Anda sudah bergabung dalam grup ini' }, { status: 400 });
    }

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: 'MEMBER'
      }
    });

    return NextResponse.json({ success: true, groupId: group.id });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
