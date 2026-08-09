import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // 4. Calculate stats for each user
    const entries: LeaderboardEntry[] = users.map((u) => {
      const userTrades = tradesByUser[u.id] || [];
      const totalTrades = userTrades.length;
      const wins = userTrades.filter((t) => t.pnl > 0).length;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
      const totalPnl = userTrades.reduce((sum, t) => sum + t.pnl, 0);

      // We don't have friends/groups system in Prisma right now, so default to empty
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
        isFriend: false,
        isMe: false, // will be evaluated on the client
        groupIds: [],
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
