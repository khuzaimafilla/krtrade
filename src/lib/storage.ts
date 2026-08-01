import { TradeLog, TradingGroup, UserProfile } from '@/types';
import { initialTrades, initialGroups } from './mockData';

const USER_KEY = 'krtrade_user_profile';
const TRADES_KEY = 'krtrade_trades';
const GROUPS_KEY = 'krtrade_groups';
const LANG_KEY = 'krtrade_language';

export function getStoredLanguage(): 'id' | 'en' {
  if (typeof window === 'undefined') return 'id';
  const lang = localStorage.getItem(LANG_KEY);
  return (lang === 'en' || lang === 'id') ? lang : 'id';
}

export function setStoredLanguage(lang: 'id' | 'en'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_KEY, lang);
}

export function getStoredUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export function getStoredTrades(): TradeLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(TRADES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function setStoredTrades(trades: TradeLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function getStoredGroups(): TradingGroup[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(GROUPS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function setStoredGroups(groups: TradingGroup[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}
