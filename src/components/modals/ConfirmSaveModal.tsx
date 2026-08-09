'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Save, X, Loader } from 'lucide-react';

interface ConfirmSaveModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function ConfirmSaveModal({
  isOpen,
  title = 'Konfirmasi Perubahan Profil',
  message = 'Apakah Anda yakin ingin menyimpan perubahan data profil dan foto profil Anda?',
  onConfirm,
  onClose,
}: ConfirmSaveModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm w-screen h-screen flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 relative text-center my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-[#6B7C72] hover:text-[#1E2923] p-1 rounded-xl hover:bg-[#F8FAF9] transition-colors btn-touch-target flex items-center justify-center disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#E6F7F0] text-[#05C46B] flex items-center justify-center mx-auto mb-4 border border-[#05C46B]/30">
          <Save className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-extrabold text-[#1E2923] font-montserrat mb-2">
          {title}
        </h3>

        <p className="text-xs text-[#6B7C72] leading-relaxed mb-6 font-medium">
          {message}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3 px-4 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-xs font-extrabold text-[#1E2923] hover:bg-[#E4E9E6] transition-colors btn-touch-target flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isLoading}
            className="py-3 px-4 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white text-xs font-extrabold shadow-md shadow-[#05C46B]/20 transition-all flex items-center justify-center space-x-2 btn-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya, Simpan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
