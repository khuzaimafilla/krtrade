'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function LogoutConfirmModal({ isOpen, onConfirm, onClose }: LogoutConfirmModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm w-screen h-screen flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 relative text-center my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6B7C72] hover:text-[#1E2923] p-1 rounded-xl hover:bg-[#F8FAF9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#FF4D4D]/10 text-[#FF4D4D] flex items-center justify-center mx-auto mb-4 border border-[#FF4D4D]/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold text-[#1E2923] font-montserrat mb-2">
          Konfirmasi Keluar Sesi
        </h3>

        <p className="text-xs text-[#6B7C72] leading-relaxed mb-6 font-medium">
          Apakah Anda yakin ingin keluar dari akun <strong>KRTrade</strong> Anda? Sesi login Anda akan diakhiri dan dialihkan ke halaman Welcome.
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-xs font-extrabold text-[#1E2923] hover:bg-[#E4E9E6] transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-3 px-4 rounded-xl bg-[#FF4D4D] hover:bg-[#E63939] text-white text-xs font-extrabold shadow-md shadow-[#FF4D4D]/20 transition-all flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
