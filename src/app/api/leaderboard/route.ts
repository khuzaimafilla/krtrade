import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { LeaderboardEntry } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        tradingStyle: true,
        bio: true,
      },
    });

    // 2. Fetch all trades for calculation
    const trades = await prisma.trade.findMany({
      select: {
        userId: true,
        pnl: true,
      },
    });

    // 3. Map trades by userId for quick lookup
    const tradesByUser = trades.reduce((acc, trade) => {
      if (!acc[trade.userId]) acc[trade.userId] = [];
      acc[trade.userId].push(trade);
      return acc;
    }, {} as Record<string, { pnl: number }[]>);

    const session = await auth();
    let myFriendIds = new Set<string>();
    let myGroupIds = new Set<string>();
    let userGroupsMap: Record<string, string[]> = {};

    if (session?.user?.id) {
      const myId = session.user.id;
      // Ambil pertemanan yang sudah ACCEPTED
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [{ requesterId: myId }, { addresseeId: myId }],
          status: 'ACCEPTED'
        }
      });
      friendships.forEach(f => {
        myFriendIds.add(f.requesterId === myId ? f.addresseeId : f.requesterId);
      });
    }

    // Ambil semua keanggotaan grup untuk semua user agar tab Community berfungsi
    const allMemberships = await prisma.groupMember.findMany({
      select: { userId: true, groupId: true }
    });
    allMemberships.forEach(m => {
      if (!userGroupsMap[m.userId]) userGroupsMap[m.userId] = [];
      userGroupsMap[m.userId].push(m.groupId);
    });

    // 4. Calculate stats for each user
    const entries: LeaderboardEntry[] = users.map((u) => {
      const userTrades = tradesByUser[u.id] || [];
      const totalTrades = userTrades.length;
      const wins = userTrades.filter((t) => t.pnl > 0).length;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
      const totalPnl = userTrades.reduce((sum, t) => sum + t.pnl, 0);

      return {
        id: u.id,
        rank: 0,
        username: u.username || '',
        fullName: u.name || u.username || 'Trader',
        avatarUrl: u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
        bio: u.bio || 'Trader aktif KRTrade Platform.',
        tradingStyle: (u.tradingStyle as any) || 'Scalping',
        totalTrades,
        winRate,
        returnPercentage: 0,
        totalPnl,
        isFriend: myFriendIds.has(u.id),
        isMe: false, // will be evaluated on the client
        groupIds: userGroupsMap[u.id] || [],
      };
    });

    // 5. Sort by winRate (descending), then totalTrades (descending)
    entries.sort((a, b) => b.winRate - a.winRate || b.totalTrades - a.totalTrades);

    // 6. Assign rank
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
