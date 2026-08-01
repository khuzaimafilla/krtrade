'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';
import { translations } from '@/lib/translations';
import { getStoredLanguage, setStoredLanguage } from '@/lib/storage';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLangModalOpen: boolean;
  openLangModal: () => void;
  closeLangModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredLanguage();
    setLanguageState(stored);
    
    // Check if user has never selected a language before
    const hasPrompted = localStorage.getItem('krtrade_lang_prompted');
    if (!hasPrompted) {
      setIsLangModalOpen(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('krtrade_lang_prompted', 'true');
    }
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations.id;
    return dict[key] || key;
  };

  const openLangModal = () => setIsLangModalOpen(true);
  const closeLangModal = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('krtrade_lang_prompted', 'true');
    }
    setIsLangModalOpen(false);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isLangModalOpen,
        openLangModal,
        closeLangModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
