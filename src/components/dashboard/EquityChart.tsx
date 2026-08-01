'use client';

import React, { useMemo } from 'react';
import { TradeLog } from '@/types';
import { TrendingUp, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface EquityChartProps {
  trades: TradeLog[];
}

export default function EquityChart({ trades }: EquityChartProps) {
  // Compute cumulative PnL series starting from initial capital e.g. $10,000
  const initialCapital = 10000;

  const points = useMemo(() => {
    let current = initialCapital;
    const result = [{ label: 'Start', value: current, pnl: 0 }];

    // Sort trades chronologically
    const sorted = [...trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((trd, idx) => {
      current += (trd.pnl || 0);
      result.push({
        label: `Trade ${idx + 1}`,
        value: current,
        pnl: trd.pnl || 0,
      });
    });

    return result;
  }, [trades]);

  const minVal = useMemo(() => {
    const vals = points.map((p) => p.value);
    const min = Math.min(...vals);
    return min * 0.98;
  }, [points]);

  const maxVal = useMemo(() => {
    const vals = points.map((p) => p.value);
    const max = Math.max(...vals);
    return max * 1.02;
  }, [points]);

  const totalReturnPercent = useMemo(() => {
    const last = points[points.length - 1]?.value || initialCapital;
    return (((last - initialCapital) / initialCapital) * 100).toFixed(2);
  }, [points]);

  // Generate SVG Path
  const width = 600;
  const height = 220;
  const padding = 30;

  const pathD = useMemo(() => {
    if (points.length < 1) return '';
    const divisor = points.length > 1 ? points.length - 1 : 1;
    const xStep = (width - padding * 2) / divisor;
    const diff = (maxVal - minVal) || 1;

    return points
      .map((pt, i) => {
        const x = padding + (points.length > 1 ? i * xStep : (width - padding * 2) / 2);
        const y = height - padding - ((pt.value - minVal) / diff) * (height - padding * 2);
        const safeX = Number.isNaN(x) ? padding : x;
        const safeY = Number.isNaN(y) ? height / 2 : y;
        return `${i === 0 ? 'M' : 'L'} ${safeX} ${safeY}`;
      })
      .join(' ');
  }, [points, minVal, maxVal]);

  const areaD = useMemo(() => {
    if (!pathD) return '';
    const xEnd = width - padding;
    const xStart = padding;
    const yBottom = height - padding;
    return `${pathD} L ${xEnd} ${yBottom} L ${xStart} ${yBottom} Z`;
  }, [pathD]);

  return (
    <div className="tradewire-card p-5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1E2923] text-lg">
              Grafik Equity & Pertumbuhan Portfolio
            </h3>
          </div>
          <p className="text-xs text-[#6B7C72] mt-0.5">
            TradingView Lightweight Engine Simulation ($10,000 Starting Balance)
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#F8FAF9] border border-[#E4E9E6] px-3 py-2 rounded-xl">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#6B7C72]">
              Return Rate
            </p>
            <p className="text-sm font-extrabold text-[#05C46B] flex items-center">
              +{totalReturnPercent}%
              <ArrowUpRight className="w-4 h-4 ml-0.5" />
            </p>
          </div>
          <div className="h-6 w-px bg-[#E4E9E6]" />
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#6B7C72]">
              Balance
            </p>
            <p className="text-sm font-extrabold text-[#1E2923]">
              ${(points[points.length - 1]?.value || initialCapital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="w-full h-56 relative bg-gradient-to-b from-[#F8FAF9] to-white rounded-xl border border-[#E4E9E6] p-2 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#05C46B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#05C46B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E4E9E6" strokeDasharray="4 4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E4E9E6" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E4E9E6" />

          {/* Area under line */}
          <path d={areaD} fill="url(#equityGrad)" />

          {/* Main Line */}
          <path d={pathD} fill="none" stroke="#05C46B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Point Markers */}
          {points.map((pt, i) => {
            const divisor = points.length > 1 ? points.length - 1 : 1;
            const xStep = (width - padding * 2) / divisor;
            const diff = (maxVal - minVal) || 1;
            const rawX = padding + (points.length > 1 ? i * xStep : (width - padding * 2) / 2);
            const rawY = height - padding - ((pt.value - minVal) / diff) * (height - padding * 2);
            const cx = Number.isNaN(rawX) ? padding : rawX;
            const cy = Number.isNaN(rawY) ? height / 2 : rawY;

            return (
              <g key={i} className="group cursor-pointer">
                <circle cx={cx} cy={cy} r="5" fill="#FFFFFF" stroke="#05C46B" strokeWidth="3" />
                {/* Tooltip on hover */}
                <title>{`${pt.label}: $${pt.value.toLocaleString()} (${pt.pnl >= 0 ? '+' : ''}$${pt.pnl})`}</title>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-[#6B7C72] mt-3">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#05C46B]" />
          <span>Realtime Risk Management Calculated</span>
        </span>
        <span>{Math.max(0, points.length - 1)} Trades Executed</span>
      </div>
    </div>
  );
}
