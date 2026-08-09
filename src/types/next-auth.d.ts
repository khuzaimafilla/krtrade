import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string;
      tradingStyle?: string;
      initialBalance?: number;
      accountCurrency?: string;
      bio?: string;
      isOnboarded?: boolean;
    } & DefaultSession['user'];
  }
}
