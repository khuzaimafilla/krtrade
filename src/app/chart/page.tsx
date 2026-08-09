'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart2, Info } from 'lucide-react';

// Dynamic import to avoid SSR issues with lightweight-charts
const KRChart = dynamic(() => import('@/components/chart/KRChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-[#0F172A] rounded-2xl border border-[#1E293B]" style={{ minHeight: '420px' }}>
      <div className="text-center text-slate-400">
        <BarChart2 className="w-8 h-8 mx-auto mb-2 animate-pulse text-[#05C46B]" />
        <p className="text-xs font-bold">Memuat Chart Engine...</p>
      </div>
    </div>
  ),
});

export default function ChartPage() {
  const [pair, setPair] = useState('XAU/USD');
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [applied, setApplied] = useState({ entry: 0, sl: 0, tp: 0 });
  const [showInfo, setShowInfo] = useState(false);

  const handleApply = () => {
    const e = parseFloat(entry);
    const s = parseFloat(sl);
    const t = parseFloat(tp);
    if (!isNaN(e) && !isNaN(s) && !isNaN(t)) {
      setApplied({ entry: e, sl: s, tp: t });
    }
  };

  return (
    <div className="space-y-5 pb-16 md:pb-8 animate-fade-in font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
              Chart Analysis
            </h1>
            <BarChart2 className="w-6 h-6 text-[#05C46B]" />
          </div>
          <p className="text-xs text-[#6B7C72] mt-1 font-medium">
            Analisis chart interaktif dengan R:R Risk Management Tool
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2.5 rounded-xl border border-[#E4E9E6] text-[#6B7C72] hover:text-[#05C46B] hover:border-[#05C46B]/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {showInfo && (
        <div className="tradewire-card p-4 bg-[#E6F7F0]/60 border-[#05C46B]/30 animate-fade-in">
          <p className="text-xs font-bold text-[#1E2923] mb-2">📖 Cara Menggunakan Chart R:R Tool</p>
          <ul className="text-xs text-[#6B7C72] space-y-1 font-medium">
            <li>1. Pilih pair dan timeframe yang diinginkan dari toolbar chart</li>
            <li>2. Klik tombol <span className="font-bold text-[#05C46B]">R:R Tool</span> untuk membuka panel entry/SL/TP</li>
            <li>3. Masukkan harga Entry, Stop Loss, dan Take Profit Anda</li>
            <li>4. Klik <span className="font-bold text-[#05C46B]">Apply</span> — garis R:R akan langsung tampil di chart</li>
            <li>5. Data chart merupakan simulasi realistis untuk latihan analisis</li>
          </ul>
        </div>
      )}

      {/* Chart */}
      <div className="h-[480px] sm:h-[520px]">
        <KRChart
          pair={pair}
          entryPrice={applied.entry || undefined}
          slPrice={applied.sl || undefined}
          tpPrice={applied.tp || undefined}
          className="h-full"
        />
      </div>

      {/* Quick Notes */}
      <div className="tradewire-card p-4">
        <p className="text-xs font-extrabold text-[#1E2923] mb-3">📝 Catatan Analisis Cepat</p>
        <textarea
          rows={3}
          placeholder="Tulis bias, level key, konfirmasi setup, dan rencana entry Anda di sini..."
          className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-xs text-[#1E2923] outline-none focus:border-[#05C46B] transition-colors resize-none font-medium"
        />
        <p className="text-[10px] text-[#6B7C72] mt-2 font-medium">
          Catatan ini hanya tersimpan sementara di sesi ini. Gunakan Jurnal untuk menyimpan secara permanen.
        </p>
      </div>
    </div>
  );
}
