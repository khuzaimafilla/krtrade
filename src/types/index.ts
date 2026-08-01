export type Language = 'id' | 'en';

export type TradingStyle = 'Swing Trade' | 'Intraday' | 'Scalping';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  tradingStyle: TradingStyle;
  isAgreedTamak: boolean;
  isAgreedFillaRichest: boolean;
  avatarUrl?: string;
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

export interface TradingGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  membersCount: number;
  totalPnl: number;
  winRate: number;
  isJoined?: boolean;
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
  monthlyReturn?: number;
  returnPercentage?: number;
  winRate: number;
  totalTrades: number;
  totalPnl: number;
  isFriend?: boolean;
  communityId?: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted';
}
