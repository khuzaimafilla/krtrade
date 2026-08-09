import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      include: {
        requester: {
          select: { id: true, username: true, name: true, image: true }
        },
        addressee: {
          select: { id: true, username: true, name: true, image: true }
        }
      }
    });

    const formattedFriendships = friendships.map(f => {
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      return {
        id: friend.id,
        username: friend.username,
        name: friend.name,
        image: friend.image,
        status: f.status, // "PENDING" | "ACCEPTED"
        isRequester: f.requesterId === userId
      };
    });

    return NextResponse.json({ friends: formattedFriendships });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId || targetUserId === session.user.id) {
      return NextResponse.json({ error: 'Invalid target user' }, { status: 400 });
    }

    // Cek apakah sudah berteman atau request sudah ada
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: session.user.id }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
         return NextResponse.json({ error: 'Kalian sudah berteman' }, { status: 400 });
      }
      if (existing.status === 'PENDING') {
         // Jika user adalah addressee, dia bisa ACCEPT
         if (existing.addresseeId === session.user.id) {
            const updated = await prisma.friendship.update({
              where: { id: existing.id },
              data: { status: 'ACCEPTED' }
            });
            return NextResponse.json({ success: true, status: 'ACCEPTED', friendship: updated });
         } else {
            return NextResponse.json({ error: 'Permintaan pertemanan sudah dikirim' }, { status: 400 });
         }
      }
    }

    // Buat request pertemanan baru
    const newFriendship = await prisma.friendship.create({
      data: {
        requesterId: session.user.id,
        addresseeId: targetUserId,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, status: 'PENDING', friendship: newFriendship });
  } catch (error) {
    console.error('Error adding friend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
