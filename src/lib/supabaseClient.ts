/**
 * @deprecated Supabase has been replaced by Neon PostgreSQL via Prisma + NextAuth.
 * This file is kept as a stub to prevent build errors during migration.
 * All Supabase usages have been replaced with:
 *   - Auth: NextAuth.js with Discord OAuth (src/auth.ts)
 *   - Database: Prisma + Neon (src/lib/prisma.ts)
 *   - API: Next.js Route Handlers (src/app/api/*)
 */

export const isSupabaseConfigured = false;

// Null stub — all calls to supabase will be no-ops
export const supabase = null as any;
