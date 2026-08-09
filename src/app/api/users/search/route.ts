import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 15,
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        tradingStyle: true,
        bio: true,
      }
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      username: u.username || 'user',
      full_name: u.name || 'User',
      avatar_url: u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
      trading_style: u.tradingStyle,
      bio: u.bio
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
