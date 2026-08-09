'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart2, Hammer } from 'lucide-react';
import Link from 'next/link';

export default function ChartPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in font-poppins min-h-[70vh] flex flex-col justify-center items-center">
      <div className="text-center space-y-6 max-w-lg mx-auto bg-white p-10 rounded-[2rem] border border-[#E4E9E6] shadow-xl shadow-[#05C46B]/5 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#05C46B]/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="flex justify-center">
          <div className="w-20 h-20 bg-[#E6F7F0] rounded-3xl flex items-center justify-center border-4 border-white shadow-sm relative">
            <BarChart2 className="w-10 h-10 text-[#05C46B]" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1E2923] rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
              <Hammer className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-[#1E2923] font-montserrat mb-2">
            Fitur Chart Sedang Dibangun!
          </h1>
          <p className="text-sm font-medium text-[#6B7C72] leading-relaxed">
            Sistem Chart Analysis interaktif sedang dalam tahap pengembangan dan penyempurnaan UI/UX. Akan segera hadir!
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link href="/dashboard" className="px-6 py-3 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs shadow-lg shadow-[#05C46B]/20 transition-transform hover:scale-105 flex items-center space-x-2">
            <span>Kembali ke Dasbor</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
