import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PUT /api/trades/[id] — update a trade
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const {
    pair, type, entryPrice, exitPrice, stopLoss, takeProfit,
    lotSize, pnl, rrRatio, strategy, notes, screenshotUrl,
  } = body;

  // Ensure trade belongs to the current user
  const existing = await prisma.trade.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
  }

  const status = pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'OPEN';

  const updated = await prisma.trade.update({
    where: { id },
    data: {
      ...(pair && { pair }),
      ...(type && { type }),
      ...(entryPrice !== undefined && { entryPrice: Number(entryPrice) }),
      ...(exitPrice !== undefined && { exitPrice: Number(exitPrice) }),
      ...(stopLoss !== undefined && { stopLoss: stopLoss ? Number(stopLoss) : null }),
      ...(takeProfit !== undefined && { takeProfit: takeProfit ? Number(takeProfit) : null }),
      ...(lotSize !== undefined && { lotSize: Number(lotSize) }),
      ...(pnl !== undefined && { pnl: Number(pnl), status }),
      ...(rrRatio !== undefined && { rrRatio: Number(rrRatio) }),
      ...(strategy !== undefined && { strategy }),
      ...(notes !== undefined && { notes }),
      ...(screenshotUrl !== undefined && { chartUrl: screenshotUrl }),
    },
  });

  return NextResponse.json({
    trade: {
      id: updated.id,
      pair: updated.pair,
      type: updated.type as 'BUY' | 'SELL',
      entryPrice: updated.entryPrice,
      exitPrice: updated.exitPrice,
      lotSize: updated.lotSize,
      pnl: updated.pnl,
      rrRatio: updated.rrRatio ?? 0,
      strategy: updated.strategy ?? 'Manual',
      notes: updated.notes ?? '',
      screenshotUrl: updated.chartUrl ?? undefined,
      date: updated.createdAt.toISOString(),
    },
  });
}

// DELETE /api/trades/[id] — delete a trade
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Ensure trade belongs to current user
  const existing = await prisma.trade.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
  }

  await prisma.trade.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
