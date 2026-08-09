import { TradeLog, TradingGroup, LeaderboardEntry, UserProfile } from '@/types';

export const initialUserProfile: UserProfile = {
  id: 'usr_khuzaima',
  fullName: 'Khuzaima Filla',
  email: 'khuzaimafilla@krtrade.com',
  username: 'khuzaimafilla',
  tradingStyle: 'Scalping',
  isAgreedTamak: true,
  isAgreedFillaRichest: true,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khuzaimafilla',
  bio: 'Developer & Creator KRTrade Platform.',
  initialBalance: 10000,
  accountCurrency: 'USD',
};

// Clean empty trades array - NO FAKE DUMMY TRADES
export const initialTrades: TradeLog[] = [];

// Clean initial groups
export const initialGroups: TradingGroup[] = [];

// Clean initial leaderboard seed
export const initialLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'khuzaimafilla',
    fullName: 'Khuzaima Filla (Developer)',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khuzaimafilla',
    tradingStyle: 'Scalping',
    winRate: 0,
    totalTrades: 0,
    totalPnl: 0,
    isFriend: true,
  },
];
