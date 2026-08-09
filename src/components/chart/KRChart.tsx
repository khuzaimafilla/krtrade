'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CandlestickSeries,
  Time,
  ColorType,
  CrosshairMode,
  LineStyle,
} from 'lightweight-charts';
import { TrendingUp, ChevronDown, Target, X } from 'lucide-react';

type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D';

interface RRMarker {
  entry: number;
  sl: number;
  tp: number;
}

interface KRChartProps {
  pair?: string;
  entryPrice?: number;
  slPrice?: number;
  tpPrice?: number;
  className?: string;
}

// ── Realistic OHLCV Simulator ─────────────────────────────────────────────────
function generateOHLCV(basePrice: number, count: number, volatility: number): CandlestickData[] {
  const data: CandlestickData[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.49) * volatility;
    const open = price;
    price = Math.max(price + change, basePrice * 0.5);
    const high = Math.max(open, price) + Math.random() * volatility * 0.4;
    const low = Math.min(open, price) - Math.random() * volatility * 0.4;
    const close = price;

    data.push({
      time: (now - i * 60) as Time,
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(Math.max(low, basePrice * 0.3).toFixed(5)),
      close: parseFloat(close.toFixed(5)),
    });
  }
  return data;
}

// Base prices per pair
const BASE_PRICES: Record<string, number> = {
  'XAU/USD': 2350,
  'BTC/USDT': 65000,
  'EUR/USD': 1.085,
  'GBP/USD': 1.27,
  'GBP/JPY': 198,
  'USD/JPY': 155,
  'ETH/USDT': 3200,
};

const VOLATILITIES: Record<string, number> = {
  'XAU/USD': 4,
  'BTC/USDT': 800,
  'EUR/USD': 0.002,
  'GBP/USD': 0.003,
  'GBP/JPY': 0.5,
  'USD/JPY': 0.3,
  'ETH/USDT': 50,
};

const TF_LABELS: Timeframe[] = ['1m', '5m', '15m', '1H', '4H', '1D'];

export default function KRChart({
  pair = 'XAU/USD',
  className = '',
}: KRChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [currentPair, setCurrentPair] = useState(pair);
  const [pairOpen, setPairOpen] = useState(false);
  const [rrMarker, setRrMarker] = useState<RRMarker | null>(null);

  const [inputEntry, setInputEntry] = useState('');
  const [inputSl, setInputSl] = useState('');
  const [inputTp, setInputTp] = useState('');
  const [showRRPanel, setShowRRPanel] = useState(false);

  // ── Chart Initialization ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 400,
      layout: {
        background: { type: ColorType.Solid, color: '#0F172A' },
        textColor: '#94A3B8',
        fontFamily: 'Poppins, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#05C46B', labelBackgroundColor: '#05C46B' },
        horzLine: { color: '#05C46B', labelBackgroundColor: '#05C46B' },
      },
      rightPriceScale: {
        borderColor: '#1E293B',
        textColor: '#64748B',
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    // v5 API: use addSeries(SeriesType, options)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          chart.resize(width, height);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  // ── Data Feed ──────────────────────────────────────────────────────────────
  const loadChartData = useCallback(() => {
    if (!candleSeriesRef.current) return;

    const base = BASE_PRICES[currentPair] ?? 100;
    const vol = VOLATILITIES[currentPair] ?? 1;
    const tfMultiplier: Record<Timeframe, number> = {
      '1m': 1, '5m': 2, '15m': 3, '1H': 5, '4H': 8, '1D': 12,
    };
    const data = generateOHLCV(base, 200, vol * tfMultiplier[timeframe]);
    candleSeriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [currentPair, timeframe]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // ── RR Price Lines ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!candleSeriesRef.current || !rrMarker) return;

    const series = candleSeriesRef.current;
    const { entry, sl, tp } = rrMarker;
    const rr = Math.abs((tp - entry) / (entry - sl));

    series.createPriceLine({
      price: entry,
      color: '#60A5FA',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: 'Entry',
    });

    series.createPriceLine({
      price: sl,
      color: '#EF4444',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: 'SL',
    });

    series.createPriceLine({
      price: tp,
      color: '#10B981',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: `TP  R:R 1:${rr.toFixed(1)}`,
    });
  }, [rrMarker]);

  const handleApplyRR = () => {
    const e = parseFloat(inputEntry);
    const s = parseFloat(inputSl);
    const t = parseFloat(inputTp);
    if (!isNaN(e) && !isNaN(s) && !isNaN(t)) {
      loadChartData();
      setTimeout(() => setRrMarker({ entry: e, sl: s, tp: t }), 80);
    }
    setShowRRPanel(false);
  };

  const rr = rrMarker
    ? Math.abs((rrMarker.tp - rrMarker.entry) / (rrMarker.entry - rrMarker.sl))
    : null;

  return (
    <div className={`flex flex-col bg-[#0F172A] rounded-2xl overflow-hidden border border-[#1E293B] ${className}`}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[#1E293B]">
        {/* Pair Selector */}
        <div className="relative">
          <button
            onClick={() => setPairOpen(!pairOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#1E293B] text-white text-xs font-extrabold hover:bg-[#273549] transition-colors min-h-[36px]"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{currentPair}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {pairOpen && (
            <div className="absolute top-full left-0 mt-1 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl z-20 min-w-[140px] overflow-hidden">
              {Object.keys(BASE_PRICES).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPair(p);
                    setPairOpen(false);
                    setRrMarker(null);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors min-h-[36px] ${
                    currentPair === p
                      ? 'bg-[#05C46B]/20 text-[#10B981]'
                      : 'text-slate-300 hover:bg-[#273549]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center space-x-1">
          {TF_LABELS.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all min-h-[32px] min-w-[32px] ${
                timeframe === tf
                  ? 'bg-[#05C46B] text-white shadow-md shadow-[#05C46B]/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* RR Tool button */}
        <button
          onClick={() => setShowRRPanel(!showRRPanel)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all min-h-[36px] ${
            rrMarker
              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
              : 'bg-[#1E293B] text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {rr ? `R:R 1:${rr.toFixed(1)}` : 'R:R Tool'}
          </span>
        </button>
      </div>

      {/* ── R:R Panel ───────────────────────────────────────────────────── */}
      {showRRPanel && (
        <div className="px-4 py-3 bg-[#0F1A2E] border-b border-[#1E293B] flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#60A5FA] w-14">Entry</span>
            <input
              type="number"
              step="any"
              value={inputEntry}
              onChange={(e) => setInputEntry(e.target.value)}
              placeholder={BASE_PRICES[currentPair]?.toFixed(2)}
              className="w-28 px-2 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white font-semibold outline-none focus:border-[#60A5FA]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#EF4444] w-14">Stop Loss</span>
            <input
              type="number"
              step="any"
              value={inputSl}
              onChange={(e) => setInputSl(e.target.value)}
              placeholder="SL Price"
              className="w-28 px-2 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white font-semibold outline-none focus:border-[#EF4444]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#10B981] w-14">Take Profit</span>
            <input
              type="number"
              step="any"
              value={inputTp}
              onChange={(e) => setInputTp(e.target.value)}
              placeholder="TP Price"
              className="w-28 px-2 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white font-semibold outline-none focus:border-[#10B981]"
            />
          </div>
          <button
            onClick={handleApplyRR}
            className="px-4 py-1.5 bg-[#05C46B] hover:bg-[#04A75B] text-white text-xs font-extrabold rounded-lg transition-colors min-h-[36px]"
          >
            Apply
          </button>
          {rrMarker && (
            <button
              onClick={() => { setRrMarker(null); loadChartData(); }}
              className="p-1.5 text-slate-400 hover:text-[#EF4444] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Chart Canvas ────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="w-full flex-1"
        style={{ minHeight: '380px' }}
      />

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-[#1E293B] flex items-center justify-between">
        <span className="text-[10px] text-slate-600 font-medium">
          KRTrade Chart Engine • Data simulasi realistis
        </span>
        {rrMarker && rr && (
          <div className="flex items-center space-x-3 text-[10px] font-bold">
            <span className="text-[#60A5FA]">E: {rrMarker.entry}</span>
            <span className="text-[#EF4444]">SL: {rrMarker.sl}</span>
            <span className="text-[#10B981]">TP: {rrMarker.tp}</span>
            <span className="text-[#D4AF37]">R:R 1:{rr.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
