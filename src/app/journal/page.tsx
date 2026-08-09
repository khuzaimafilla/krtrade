'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TradeLog, formatCurrencyAmount } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getStoredTrades, setStoredTrades } from '@/lib/storage';
import TradeModal from '@/components/modals/TradeModal';
import BackupRestoreModal from '@/components/modals/BackupRestoreModal';
import TradeCardExport from '@/components/journal/TradeCardExport';
import { KRBackupData } from '@/lib/utils/backup';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  ImageIcon,
  HardDrive,
  Share2,
} from 'lucide-react';

export default function JournalPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const currency = user?.accountCurrency || 'USD';

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPair, setSelectedPair] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState('ALL');
  const [selectedResult, setSelectedResult] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<TradeLog | null>(null);

  // Backup/Restore modal
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Victory Card
  const [shareCardTrade, setShareCardTrade] = useState<TradeLog | null>(null);

  const handleRestoreComplete = (backup: KRBackupData) => {
    const restored = backup.trades;
    setTrades(restored);
    setStoredTrades(restored);
  };

  useEffect(() => {
    async function loadTrades() {
      if (user) {
        try {
          const res = await fetch('/api/trades');
          if (res.ok) {
            const { trades: neonTrades } = await res.json();
            setTrades(neonTrades);
            setStoredTrades(neonTrades); // cache locally
            return;
          }
        } catch {
          // Network error — fallback to localStorage
        }
      }
      setTrades(getStoredTrades());
    }
    loadTrades();
  }, [user]);

  const saveTradesToStorage = (updated: TradeLog[]) => {
    setTrades(updated);
    setStoredTrades(updated);
  };

  const handleAddOrUpdate = async (tradeData: Omit<TradeLog, 'id'> & { id?: string }) => {
    if (user) {
      if (tradeData.id) {
        // Update existing
        try {
          const res = await fetch(`/api/trades/${tradeData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tradeData),
          });
          if (res.ok) {
            const { trade: updated } = await res.json();
            const newList = trades.map((t) => t.id === updated.id ? updated : t);
            setTrades(newList);
            setStoredTrades(newList);
            return;
          }
        } catch { /* fallback */ }
      } else {
        // Create new
        try {
          const res = await fetch('/api/trades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tradeData),
          });
          if (res.ok) {
            const { trade: created } = await res.json();
            const newList = [created, ...trades];
            setTrades(newList);
            setStoredTrades(newList);
            return;
          }
        } catch { /* fallback */ }
      }
    }

    // localStorage fallback
    if (tradeData.id) {
      const updated = trades.map((t) => (t.id === tradeData.id ? (tradeData as TradeLog) : t));
      saveTradesToStorage(updated);
    } else {
      const newTrade: TradeLog = { ...(tradeData as TradeLog), id: 'trd_' + Date.now() };
      saveTradesToStorage([newTrade, ...trades]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini dari jurnal?')) {
      try {
        await fetch(`/api/trades/${id}`, { method: 'DELETE' });
      } catch { /* fallback */ }
      const updated = trades.filter((t) => t.id !== id);
      saveTradesToStorage(updated);
    }
  };

  const pairsList = useMemo(() => {
    const set = new Set(trades.map((t) => t.pair));
    return Array.from(set);
  }, [trades]);

  const strategiesList = useMemo(() => {
    const set = new Set(trades.map((t) => t.strategy));
    return Array.from(set);
  }, [trades]);

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trd) => {
      // Search
      const matchesSearch =
        trd.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trd.strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trd.notes.toLowerCase().includes(searchQuery.toLowerCase());

      // Pair filter
      const matchesPair = selectedPair === 'ALL' || trd.pair === selectedPair;

      // Strategy filter
      const matchesStrategy = selectedStrategy === 'ALL' || trd.strategy === selectedStrategy;

      // Win/Loss filter
      const matchesResult =
        selectedResult === 'ALL' ||
        (selectedResult === 'WIN' && trd.pnl > 0) ||
        (selectedResult === 'LOSS' && trd.pnl < 0);

      return matchesSearch && matchesPair && matchesStrategy && matchesResult;
    });
  }, [trades, searchQuery, selectedPair, selectedStrategy, selectedResult]);

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923]">
            {t('journalTitle')}
          </h1>
          <p className="text-xs text-[#6B7C72] mt-1">
            Catatan Transaksi, Risk Reward, Strategy Tags & Proof Chart
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsBackupOpen(true)}
            className="px-4 py-3 rounded-2xl bg-[#F8FAF9] border border-[#E4E9E6] hover:border-[#05C46B]/40 text-[#6B7C72] hover:text-[#05C46B] text-sm font-bold flex items-center justify-center space-x-2 transition-colors min-h-[44px]"
          >
            <HardDrive className="w-4 h-4" />
            <span className="hidden sm:inline">Backup</span>
          </button>
          <button
            onClick={() => {
              setEditingTrade(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-bold text-sm shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-105 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addTradeBtn')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="tradewire-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full p-2.5 pl-9 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-xs font-semibold text-[#1E2923] focus:border-[#05C46B] outline-none"
            />
            <Search className="w-4 h-4 text-[#6B7C72] absolute left-3 top-3" />
          </div>

          {/* Pair Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#6B7C72] shrink-0" />
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-xs font-bold text-[#1E2923] outline-none"
            >
              <option value="ALL">{t('allPairs')}</option>
              {pairsList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Strategy Filter */}
          <div>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-xs font-bold text-[#1E2923] outline-none"
            >
              <option value="ALL">{t('allStrategies')}</option>
              {strategiesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Result Filter (Win/Loss) */}
          <div className="grid grid-cols-3 gap-1 bg-[#F8FAF9] p-1 rounded-xl border border-[#E4E9E6]">
            <button
              type="button"
              onClick={() => setSelectedResult('ALL')}
              className={`py-1.5 rounded-lg text-[11px] font-bold ${
                selectedResult === 'ALL' ? 'bg-white text-[#1E2923] shadow-sm' : 'text-[#6B7C72]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedResult('WIN')}
              className={`py-1.5 rounded-lg text-[11px] font-bold ${
                selectedResult === 'WIN' ? 'bg-[#05C46B] text-white' : 'text-[#05C46B]'
              }`}
            >
              Win
            </button>
            <button
              type="button"
              onClick={() => setSelectedResult('LOSS')}
              className={`py-1.5 rounded-lg text-[11px] font-bold ${
                selectedResult === 'LOSS' ? 'bg-[#FF4D4D] text-white' : 'text-[#FF4D4D]'
              }`}
            >
              Loss
            </button>
          </div>
        </div>
      </div>

      {/* Trades Table & Cards */}
      <div className="tradewire-card overflow-hidden">
        <div className="p-4 border-b border-[#E4E9E6] flex items-center justify-between text-xs text-[#6B7C72] font-semibold">
          <span>Menampilkan <strong>{filteredTrades.length}</strong> transaksi</span>
          <span>Total PnL Terfilter: <strong className={filteredTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'}>{formatCurrencyAmount(filteredTrades.reduce((s, t) => s + t.pnl, 0), currency)}</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E9E6] text-[11px] font-extrabold uppercase text-[#6B7C72] bg-[#F8FAF9]">
                <th className="py-3 px-4">Pair & Type</th>
                <th className="py-3 px-4">Entry / Exit</th>
                <th className="py-3 px-4">Lot</th>
                <th className="py-3 px-4">RRR</th>
                <th className="py-3 px-4">Strategy & Notes</th>
                <th className="py-3 px-4">Chart Proof</th>
                <th className="py-3 px-4">PnL ({currency === 'CENT' ? 'USc' : currency === 'IDR' ? 'Rp' : '$'})</th>
                <th className="py-3 px-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9E6] text-xs font-semibold">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B7C72]">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trd) => (
                  <tr key={trd.id} className="hover:bg-[#F8FAF9] transition-colors">
                    {/* Pair & Type */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-[#1E2923]">{trd.pair}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            trd.type === 'BUY'
                              ? 'bg-[#E6F7F0] text-[#05C46B]'
                              : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
                          }`}
                        >
                          {trd.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B7C72] mt-0.5">
                        {new Date(trd.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                      </p>
                    </td>

                    {/* Entry / Exit */}
                    <td className="py-3.5 px-4 text-[#1E2923]">
                      <div className="text-xs font-bold">{trd.entryPrice.toLocaleString()}</div>
                      <div className="text-[10px] text-[#6B7C72]">to {trd.exitPrice.toLocaleString()}</div>
                    </td>

                    {/* Lot */}
                    <td className="py-3.5 px-4 text-[#1E2923] font-bold">
                      {trd.lotSize}
                    </td>

                    {/* RRR */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded-lg bg-[#E6F7F0] text-[#05C46B] text-[11px] font-extrabold">
                        1:{trd.rrRatio}
                      </span>
                    </td>

                    {/* Strategy & Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-[#1E2923]">{trd.strategy}</p>
                      <p className="text-[11px] text-[#6B7C72] truncate">{trd.notes}</p>
                    </td>

                    {/* Chart proof */}
                    <td className="py-3.5 px-4">
                      {trd.screenshotUrl ? (
                        <a
                          href={trd.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#F8FAF9] border border-[#E4E9E6] text-[10px] font-bold text-[#05C46B] hover:border-[#05C46B]"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>View Chart</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#6B7C72]">-</span>
                      )}
                    </td>

                    {/* PnL ($) */}
                    <td className="py-3.5 px-4 font-extrabold">
                      <span
                        className={`inline-flex items-center text-sm ${
                          trd.pnl >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'
                        }`}
                      >
                        {trd.pnl >= 0 ? (
                          <ArrowUpRight className="w-4 h-4 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-0.5" />
                        )}
                        {trd.pnl >= 0 ? '+' : ''}{formatCurrencyAmount(Math.abs(trd.pnl), currency)}
                      </span>
                    </td>

                    {/* Actions */}
                     <td className="py-3.5 px-4 text-right space-x-1">
                       <button
                         onClick={() => setShareCardTrade(trd)}
                         title="Bagikan Victory Card"
                         className="p-1.5 text-[#6B7C72] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                       >
                         <Share2 className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => {
                           setEditingTrade(trd);
                           setIsModalOpen(true);
                         }}
                         className="p-1.5 text-[#6B7C72] hover:text-[#05C46B] hover:bg-[#E6F7F0] rounded-lg transition-colors"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => handleDelete(trd.id)}
                         className="p-1.5 text-[#6B7C72] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded-lg transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddOrUpdate}
        initialTrade={editingTrade}
      />

      {/* Backup / Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        trades={trades}
        profile={user || undefined}
        onRestoreComplete={handleRestoreComplete}
      />

      {/* Victory Card / Share Modal */}
      {shareCardTrade && (
        <TradeCardExport
          isOpen={!!shareCardTrade}
          onClose={() => setShareCardTrade(null)}
          trade={shareCardTrade}
          username={user?.username}
          accountCurrency={user?.accountCurrency}
        />
      )}
    </div>
  );
}
