import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in font-poppins">
      <div className="p-4 rounded-3xl bg-[#E6F7F0] border border-[#05C46B]/30 mb-3 shadow-md">
        <RefreshCw className="w-8 h-8 text-[#05C46B] animate-spin" />
      </div>
      <h3 className="text-sm font-extrabold text-[#1E2923] font-montserrat">
        Memuat Halaman...
      </h3>
      <p className="text-xs text-[#6B7C72] mt-1 font-medium">
        KRtrade Platform — Menyiapkan data trading Anda
      </p>
    </div>
  );
}
