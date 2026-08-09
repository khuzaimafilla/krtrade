'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, Check, ShieldCheck } from 'lucide-react';

export default function LanguageSelectorModal() {
  const { language, setLanguage, isLangModalOpen, closeLangModal, t } = useLanguage();

  if (!isLangModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm w-screen h-screen flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-[#E6F7F0] rounded-xl text-[#05C46B]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1E2923]">
              {t('selectLanguageTitle')}
            </h3>
            <p className="text-xs text-[#6B7C72]">
              KRTrade Multi-Language Engine
            </p>
          </div>
        </div>

        <p className="text-sm text-[#6B7C72] mb-6">
          {t('selectLanguageDesc')}
        </p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {/* Bahasa Indonesia */}
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
              language === 'id'
                ? 'border-[#05C46B] bg-[#E6F7F0] text-[#1E2923] font-semibold shadow-sm'
                : 'border-[#E4E9E6] bg-white text-[#1E2923] hover:border-[#05C46B]/40'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇮🇩</span>
              <div>
                <p className="font-semibold text-sm">Bahasa Indonesia</p>
                <p className="text-xs text-[#6B7C72]">Default - Komunitas 9 Naga</p>
              </div>
            </div>
            {language === 'id' && (
              <div className="w-6 h-6 rounded-full bg-[#05C46B] text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
              language === 'en'
                ? 'border-[#05C46B] bg-[#E6F7F0] text-[#1E2923] font-semibold shadow-sm'
                : 'border-[#E4E9E6] bg-white text-[#1E2923] hover:border-[#05C46B]/40'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <p className="font-semibold text-sm">English</p>
                <p className="text-xs text-[#6B7C72]">Global Financial Standard</p>
              </div>
            </div>
            {language === 'en' && (
              <div className="w-6 h-6 rounded-full bg-[#05C46B] text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E4E9E6]">
          <button
            type="button"
            onClick={closeLangModal}
            className="w-full py-3 px-4 bg-[#05C46B] hover:bg-[#04A75B] text-white font-semibold rounded-xl shadow-md shadow-[#05C46B]/20 transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('save')} & {t('close')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
