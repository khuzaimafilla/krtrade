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

    const groups = await prisma.group.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedGroups = groups.map(g => {
      const isJoined = g.members.some(m => m.userId === userId);

      return {
        id: g.id,
        name: g.name,
        code: g.code,
        description: g.description || '',
        membersCount: g.members.length,
        totalPnl: 0,
        winRate: 0,
        isJoined,
        createdBy: g.createdBy,
        members: g.members.map(m => ({
          id: m.user.id,
          username: m.user.username || '',
          fullName: m.user.name || '',
          avatarUrl: m.user.image || '',
          role: m.role.toLowerCase(),
          joinedAt: m.joinedAt.toISOString(),
        }))
      };
    });

    return NextResponse.json({ groups: formattedGroups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nama grup diperlukan' }, { status: 400 });
    }

    let code = '';
    let isUnique = false;
    while (!isUnique) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await prisma.group.findUnique({ where: { code } });
      if (!existing) isUnique = true;
    }

    const newGroup = await prisma.group.create({
      data: {
        name,
        description,
        code,
        createdBy: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN',
          }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
