export type Language = 'id' | 'en';

export type TradingStyle = 'Swing Trade' | 'Intraday' | 'Scalping';

export type AccountCurrency = 'USD' | 'CENT' | 'IDR';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  tradingStyle: TradingStyle;
  isAgreedTamak: boolean;
  isAgreedFillaRichest: boolean;
  avatarUrl?: string;
  bio?: string;
  initialBalance?: number;
  accountCurrency?: AccountCurrency;
  createdAt?: string;
}

export interface TradeLog {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  pnl: number;
  rrRatio: number;
  strategy: string;
  notes: string;
  screenshotUrl?: string;
  date: string; // ISO string
}

export interface GroupMemberDetail {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'member';
  joinedAt?: string;
}

export interface TradingGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  membersCount: number;
  totalPnl: number;
  winRate: number;
  isJoined?: boolean;
  createdBy?: string; // User ID of the creator/admin
  members?: GroupMemberDetail[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: string;
}

export interface LeaderboardEntry {
  id?: string;
  rank: number;
  username: string;
  fullName?: string;
  avatar?: string;
  avatarUrl?: string;
  tradingStyle: TradingStyle;
  bio?: string;
  monthlyReturn?: number;
  returnPercentage?: number;
  winRate: number;
  totalTrades: number;
  totalPnl: number;
  accountCurrency?: AccountCurrency;
  isFriend?: boolean;
  communityId?: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted';
}

export function isCreatorUser(username?: string): boolean {
  if (!username) return false;
  const cleanName = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanName.includes('khuzaimafilla') || cleanName === 'khuzaimafilla';
}

export function formatCurrencyAmount(
  amount: number,
  currency: AccountCurrency = 'USD'
): string {
  if (currency === 'IDR') {
    const idrVal = Math.round(amount * 15500);
    return `Rp ${idrVal.toLocaleString('id-ID')}`;
  }
  if (currency === 'CENT') {
    const centVal = Math.round(amount * 100);
    return `${centVal.toLocaleString('en-US')} USc`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
