'use client';

import React, { useState, useEffect } from 'react';
import { TradeLog } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { X, Save, Upload, Loader } from 'lucide-react';
import { convertFileToBase64 } from '@/lib/imageHelper';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<TradeLog, 'id'> & { id?: string }) => Promise<void>;
  initialTrade?: TradeLog | null;
}

export default function TradeModal({
  isOpen,
  onClose,
  onSave,
  initialTrade,
}: TradeModalProps) {
  const { t } = useLanguage();

  const [pair, setPair] = useState('XAU/USD');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [lotSize, setLotSize] = useState('1.0');
  const [pnl, setPnl] = useState('');
  const [rrRatio, setRrRatio] = useState('2.5');
  const [strategy, setStrategy] = useState('SMC Liquidity Grab');
  const [notes, setNotes] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialTrade) {
      setPair(initialTrade.pair);
      setType(initialTrade.type);
      setEntryPrice(initialTrade.entryPrice.toString());
      setExitPrice(initialTrade.exitPrice.toString());
      setLotSize(initialTrade.lotSize.toString());
      setPnl(initialTrade.pnl.toString());
      setRrRatio(initialTrade.rrRatio.toString());
      setStrategy(initialTrade.strategy);
      setNotes(initialTrade.notes);
      setScreenshotUrl(initialTrade.screenshotUrl || '');
    } else {
      setPair('XAU/USD');
      setType('BUY');
      setEntryPrice('');
      setExitPrice('');
      setLotSize('1.0');
      setPnl('');
      setRrRatio('2.5');
      setStrategy('SMC Liquidity Grab');
      setNotes('');
      setScreenshotUrl('');
    }
    setIsLoading(false);
  }, [initialTrade, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({
        id: initialTrade?.id,
        pair,
        type,
        entryPrice: parseFloat(entryPrice) || 0,
        exitPrice: parseFloat(exitPrice) || 0,
        lotSize: parseFloat(lotSize) || 0.1,
        pnl: parseFloat(pnl) || 0,
        rrRatio: parseFloat(rrRatio) || 1.0,
        strategy,
        notes,
        screenshotUrl: screenshotUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
        date: initialTrade?.date || new Date().toISOString(),
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm w-screen h-screen flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto">
        <div className="flex items-center justify-between border-b border-[#E4E9E6] pb-4 mb-4">
          <h3 className="text-xl font-bold text-[#1E2923]">
            {initialTrade ? 'Edit Jurnal Transaksi' : t('addTradeBtn')}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-[#6B7C72] hover:text-[#1E2923] hover:bg-[#F8FAF9] rounded-xl transition-colors btn-touch-target flex items-center justify-center disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Pair / Aset</label>
              <input
                type="text"
                required
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="XAU/USD, EUR/USD..."
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Posisi Trading</label>
              <div className="grid grid-cols-2 gap-2 bg-[#F8FAF9] p-1 rounded-xl border border-[#E4E9E6]">
                <button
                  type="button"
                  onClick={() => setType('BUY')}
                  className={`py-2 rounded-lg text-xs font-extrabold transition-all btn-touch-target flex items-center justify-center ${
                    type === 'BUY'
                      ? 'bg-[#05C46B] text-white shadow-sm'
                      : 'text-[#6B7C72] hover:text-[#1E2923]'
                  }`}
                >
                  BUY 🚀
                </button>
                <button
                  type="button"
                  onClick={() => setType('SELL')}
                  className={`py-2 rounded-lg text-xs font-extrabold transition-all btn-touch-target flex items-center justify-center ${
                    type === 'SELL'
                      ? 'bg-[#FF4D4D] text-white shadow-sm'
                      : 'text-[#6B7C72] hover:text-[#1E2923]'
                  }`}
                >
                  SELL 🔻
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                required
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="2035.50"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Exit Price</label>
              <input
                type="number"
                step="any"
                required
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="2045.00"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Lot Size</label>
              <input
                type="number"
                step="0.01"
                required
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                placeholder="1.0"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">PnL Net</label>
              <input
                type="number"
                step="any"
                required
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                placeholder="+150 / -50"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">R:R Ratio</label>
              <input
                type="number"
                step="0.1"
                required
                value={rrRatio}
                onChange={(e) => setRrRatio(e.target.value)}
                placeholder="2.5"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Strategi / Setup</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors cursor-pointer"
            >
              <option value="SMC Liquidity Grab">SMC Liquidity Grab</option>
              <option value="Breakout Retest">Breakout Retest</option>
              <option value="Supply & Demand Zone">Supply & Demand Zone</option>
              <option value="Trendline Bounce">Trendline Bounce</option>
              <option value="Filla 9 Naga Scalp">Filla 9 Naga Scalp</option>
              <option value="Order Block Entry">Order Block Entry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Catatan Transaksi</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan psikologi, konfirmasi setup..."
              className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] outline-none focus:border-[#05C46B] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
              Upload Screenshot Chart Proof (File / Kamera)
            </label>
            {screenshotUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#E4E9E6] bg-[#F8FAF9] group">
                <img
                  src={screenshotUrl}
                  alt="Chart Proof Preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-3 transition-opacity">
                  <label className="px-3 py-1.5 rounded-xl bg-white text-[#1E2923] text-xs font-extrabold cursor-pointer hover:bg-[#E4E9E6] transition-colors btn-touch-target flex items-center justify-center">
                    <span>Ganti Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const base64 = await convertFileToBase64(file);
                          setScreenshotUrl(base64);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setScreenshotUrl('')}
                    className="px-3 py-1.5 rounded-xl bg-[#FF4D4D] text-white text-xs font-extrabold hover:bg-[#E63939] transition-colors btn-touch-target flex items-center justify-center"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#05C46B]/40 hover:border-[#05C46B] bg-[#E6F7F0]/30 hover:bg-[#E6F7F0]/60 rounded-2xl cursor-pointer transition-all text-center">
                <Upload className="w-8 h-8 text-[#05C46B] mb-2" />
                <span className="text-xs font-extrabold text-[#1E2923]">Pilih Screenshot Chart</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const base64 = await convertFileToBase64(file);
                      setScreenshotUrl(base64);
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E4E9E6]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-[#E4E9E6] text-sm font-bold text-[#6B7C72] hover:bg-[#F8FAF9] btn-touch-target flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white text-sm font-bold shadow-md shadow-[#05C46B]/20 flex items-center space-x-2 btn-touch-target justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
