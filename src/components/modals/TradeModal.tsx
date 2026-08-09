'use client';

import React, { useState, useEffect } from 'react';
import { TradeLog } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { X, Save, Upload, Loader } from 'lucide-react';

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
  
  const [pnlResult, setPnlResult] = useState<'PROFIT' | 'LOSS' | 'BE'>('PROFIT');
  const [pnlAmount, setPnlAmount] = useState('');
  
  const [riskInput, setRiskInput] = useState('1');
  const [rewardInput, setRewardInput] = useState('2.5');
  
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
      
      setPnlResult(initialTrade.pnl > 0 ? 'PROFIT' : initialTrade.pnl < 0 ? 'LOSS' : 'BE');
      setPnlAmount(Math.abs(initialTrade.pnl).toString());
      
      setRiskInput('1');
      setRewardInput(initialTrade.rrRatio.toString());
      
      setStrategy(initialTrade.strategy);
      setNotes(initialTrade.notes);
      setScreenshotUrl(initialTrade.screenshotUrl || '');
    } else {
      setPair('XAU/USD');
      setType('BUY');
      setEntryPrice('');
      setExitPrice('');
      setLotSize('1.0');
      setPnlResult('PROFIT');
      setPnlAmount('');
      setRiskInput('1');
      setRewardInput('2.5');
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
      let finalPnl = parseFloat(pnlAmount) || 0;
      if (pnlResult === 'LOSS') finalPnl = -1 * finalPnl;
      else if (pnlResult === 'BE') finalPnl = 0;

      let finalRr = parseFloat(rewardInput) / parseFloat(riskInput);
      if (isNaN(finalRr) || !isFinite(finalRr)) finalRr = 1.0;

      await onSave({
        id: initialTrade?.id,
        pair,
        type,
        entryPrice: parseFloat(entryPrice) || 0,
        exitPrice: parseFloat(exitPrice) || 0,
        lotSize: parseFloat(lotSize) || 0.1,
        pnl: finalPnl,
        rrRatio: parseFloat(finalRr.toFixed(1)),
        strategy,
        notes,
        screenshotUrl: screenshotUrl || '',
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
            {initialTrade ? 'Edit Jurnal Transaksi' : t('modal_title_log')}
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
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">{t('field_pair')}</label>
              <input
                type="text"
                list="pairsList"
                required
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="XAU/USD, EUR/USD..."
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
              />
              <datalist id="pairsList">
                <option value="XAU/USD" />
                <option value="EUR/USD" />
                <option value="GBP/USD" />
                <option value="USD/JPY" />
                <option value="BTC/USD" />
                <option value="ETH/USD" />
              </datalist>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">{t('field_outcome')}</label>
              <div className="flex flex-col space-y-2">
                <div className="flex bg-[#F8FAF9] p-1 rounded-xl border border-[#E4E9E6]">
                  <button
                    type="button"
                    onClick={() => setPnlResult('PROFIT')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${pnlResult === 'PROFIT' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#6B7C72]'}`}
                  >
                    🟢 Profit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPnlResult('LOSS')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${pnlResult === 'LOSS' ? 'bg-[#EF4444] text-white shadow-sm' : 'text-[#6B7C72]'}`}
                  >
                    🔴 Loss
                  </button>
                  <button
                    type="button"
                    onClick={() => setPnlResult('BE')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${pnlResult === 'BE' ? 'bg-slate-300 text-slate-800 shadow-sm' : 'text-[#6B7C72]'}`}
                  >
                    ⚪ BE
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required={pnlResult !== 'BE'}
                  disabled={pnlResult === 'BE'}
                  value={pnlResult === 'BE' ? '0' : pnlAmount}
                  onChange={(e) => setPnlAmount(e.target.value)}
                  placeholder={t('field_amount')}
                  className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-2">
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
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Risk : Reward Ratio</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={riskInput}
                    onChange={(e) => setRiskInput(e.target.value)}
                    placeholder="Risk"
                    className="w-16 p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-center text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
                  />
                  <span className="font-extrabold text-[#6B7C72]">:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={rewardInput}
                    onChange={(e) => setRewardInput(e.target.value)}
                    placeholder="Reward"
                    className="flex-1 p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-center text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">Strategi / Setup</label>
            <input
              type="text"
              list="strategiesList"
              required
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="Pilih atau ketik strategi..."
              className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
            />
            <datalist id="strategiesList">
              <option value="SMC Liquidity Grab" />
              <option value="Order Block / FVG" />
              <option value="Breakout & Retest" />
              <option value="Supply & Demand" />
              <option value="Trendline Break" />
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1 flex items-center justify-between">
              <span>{t('field_notes')}</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan psikologi, konfirmasi setup..."
              className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] outline-none focus:border-[#05C46B] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1 flex items-center justify-between">
              <span>{t('field_chart_url')}</span>
            </label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://www.tradingview.com/x/..."
              className="w-full p-3.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-extrabold outline-none focus:border-[#05C46B] transition-colors"
            />
            {screenshotUrl && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-[#E4E9E6] bg-slate-100 h-32">
                <img
                  src={screenshotUrl}
                  alt="Chart Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/F8FAF9/6B7C72?text=Invalid+Image+URL';
                  }}
                />
              </div>
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
