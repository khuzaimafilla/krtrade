'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome onboarding flow first as specified in prompt
    router.replace('/welcome');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-[#05C46B] animate-pulse" />
        <p className="text-xs font-bold text-[#6B7C72]">KRTrade loading...</p>
      </div>
    </div>
  );
}
