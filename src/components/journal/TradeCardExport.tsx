'use client';

import React, { useRef, useState } from 'react';
import { TradeLog, formatCurrencyAmount, AccountCurrency } from '@/types';
import { X, Download, Copy, TrendingUp, CheckCircle2, Loader, Share2 } from 'lucide-react';

interface TradeCardExportProps {
  trade: TradeLog;
  username?: string;
  accountCurrency?: AccountCurrency;
  isOpen: boolean;
  onClose: () => void;
}

export default function TradeCardExport({
  trade,
  username = 'Trader',
  accountCurrency = 'USD',
  isOpen,
  onClose,
}: TradeCardExportProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  if (!isOpen) return null;

  const isWin = trade.pnl > 0;
  const pnlFormatted = `${isWin ? '+' : ''}${formatCurrencyAmount(trade.pnl, accountCurrency)}`;
  const dateFormatted = new Date(trade.date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const rr = `1:${trade.rrRatio.toFixed(1)}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `krtrade-card-${trade.pair.replace('/', '-')}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    setIsCopying(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopyDone(true);
          setTimeout(() => setCopyDone(false), 2500);
        } catch {
          // Fallback: open in new tab
          window.open(canvas.toDataURL('image/png'), '_blank');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="w-full max-w-sm">
        {/* Controls */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white font-extrabold text-sm">Victory Card KRtrade</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── The Card (to be screenshotted) ──────────────────────── */}
        <div
          ref={cardRef}
          className="relative rounded-3xl overflow-hidden select-none"
          style={{
            background: isWin
              ? 'linear-gradient(135deg, #042F2E 0%, #064E3B 50%, #065F46 100%)'
              : 'linear-gradient(135deg, #1C0A0A 0%, #450A0A 50%, #7F1D1D 100%)',
          }}
        >
          {/* Decorative radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isWin
                ? 'radial-gradient(circle at 80% 20%, rgba(16,185,129,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle at 80% 20%, rgba(239,68,68,0.15) 0%, transparent 70%)',
            }}
          />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 20px)',
            }}
          />

          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                {/* Logo icon */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#05C46B] to-[#D4AF37] flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm leading-none">KRtrade</p>
                  <p className="text-[10px] text-white/60 font-medium">Kronik Reward</p>
                </div>
              </div>

              {/* WIN / LOSS Badge */}
              <div
                className={`px-4 py-1.5 rounded-full font-black text-sm border ${
                  isWin
                    ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                    : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                }`}
              >
                {isWin ? '✅ WIN' : '❌ LOSS'}
              </div>
            </div>

            {/* Ticker */}
            <div className="mb-4">
              <p className="text-4xl font-black text-white tracking-tight leading-none">
                {trade.pair}
              </p>
              <div className="flex items-center space-x-2 mt-1.5">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                    trade.type === 'BUY'
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : 'bg-[#EF4444]/20 text-[#EF4444]'
                  }`}
                >
                  {trade.type}
                </span>
                <span className="text-white/50 text-xs font-medium">{trade.strategy}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-4" />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {/* PnL */}
              <div className="col-span-3">
                <p className="text-white/50 text-[10px] font-bold uppercase mb-0.5">Net PnL</p>
                <p
                  className={`text-3xl font-black ${
                    isWin ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {pnlFormatted}
                </p>
              </div>

              {/* R:R */}
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase mb-0.5">R:R Ratio</p>
                <p className="text-lg font-black text-[#D4AF37]">{rr}</p>
              </div>

              {/* Entry */}
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase mb-0.5">Entry</p>
                <p className="text-sm font-extrabold text-white">{trade.entryPrice.toLocaleString()}</p>
              </div>

              {/* Exit */}
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase mb-0.5">Exit</p>
                <p className="text-sm font-extrabold text-white">{trade.exitPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Footer Row */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <div>
                <p className="text-white/40 text-[9px] font-bold uppercase">Trader</p>
                <p className="text-white/80 text-xs font-extrabold">@{username}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[9px] font-bold uppercase">Tanggal</p>
                <p className="text-white/80 text-[10px] font-bold">{dateFormatted}</p>
              </div>
            </div>

            {/* Watermark */}
            <div className="mt-3 text-center">
              <p className="text-white/20 text-[9px] font-medium tracking-widest uppercase">
                KRtrade — Kronik Reward Journaling Platform
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs shadow-md shadow-[#05C46B]/20 transition-all min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Mengunduh...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            disabled={isCopying}
            className={`flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-extrabold text-xs transition-all min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed ${
              copyDone
                ? 'bg-[#E6F7F0] text-[#05C46B] border border-[#05C46B]/30'
                : 'bg-[#1E2923] hover:bg-[#2D3A34] text-white'
            }`}
          >
            {isCopying ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Menyalin...</span>
              </>
            ) : copyDone ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Image</span>
              </>
            )}
          </button>
        </div>

        <p className="text-center text-slate-500 text-[10px] mt-3 font-medium">
          Siap dibagikan ke WhatsApp, Discord, atau Instagram Stories
        </p>
      </div>
    </div>
  );
}
