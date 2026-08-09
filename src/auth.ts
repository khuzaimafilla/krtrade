import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Attach database user id & KRtrade profile fields to session
      if (session.user && user) {
        session.user.id = user.id;
        // Fetch extended profile from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            username: true,
            tradingStyle: true,
            initialBalance: true,
            accountCurrency: true,
            bio: true,
            isOnboarded: true,
          },
        });
        if (dbUser) {
          session.user.username = dbUser.username ?? undefined;
          session.user.tradingStyle = dbUser.tradingStyle ?? 'Scalping';
          session.user.initialBalance = dbUser.initialBalance ?? 10000;
          session.user.accountCurrency = dbUser.accountCurrency ?? 'USD';
          session.user.bio = dbUser.bio ?? '';
          session.user.isOnboarded = dbUser.isOnboarded ?? false;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
