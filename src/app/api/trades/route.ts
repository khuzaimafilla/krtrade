import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/trades — fetch all trades for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Map Prisma Trade → KRTrade TradeLog interface
  const mapped = trades.map((t) => ({
    id: t.id,
    pair: t.pair,
    type: t.type as 'BUY' | 'SELL',
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice,
    lotSize: t.lotSize,
    pnl: t.pnl,
    rrRatio: t.rrRatio ?? 0,
    strategy: t.strategy ?? 'Manual',
    notes: t.notes ?? '',
    screenshotUrl: t.chartUrl ?? undefined,
    date: t.createdAt.toISOString(),
  }));

  return NextResponse.json({ trades: mapped });
}

// POST /api/trades — create new trade
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    pair, type, entryPrice, exitPrice, stopLoss, takeProfit,
    lotSize, pnl, rrRatio, strategy, notes, screenshotUrl,
  } = body;

  if (!pair || !type || entryPrice === undefined || exitPrice === undefined || !lotSize) {
    return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 });
  }

  const status = pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'OPEN';

  const trade = await prisma.trade.create({
    data: {
      userId: session.user.id,
      pair,
      type,
      entryPrice: Number(entryPrice),
      exitPrice: Number(exitPrice),
      stopLoss: stopLoss ? Number(stopLoss) : null,
      takeProfit: takeProfit ? Number(takeProfit) : null,
      lotSize: Number(lotSize),
      pnl: Number(pnl),
      rrRatio: rrRatio ? Number(rrRatio) : null,
      strategy: strategy ?? 'Manual',
      notes: notes ?? '',
      chartUrl: screenshotUrl ?? null,
      status,
    },
  });

  return NextResponse.json({
    trade: {
      id: trade.id,
      pair: trade.pair,
      type: trade.type as 'BUY' | 'SELL',
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      lotSize: trade.lotSize,
      pnl: trade.pnl,
      rrRatio: trade.rrRatio ?? 0,
      strategy: trade.strategy ?? 'Manual',
      notes: trade.notes ?? '',
      screenshotUrl: trade.chartUrl ?? undefined,
      date: trade.createdAt.toISOString(),
    },
  }, { status: 201 });
}
