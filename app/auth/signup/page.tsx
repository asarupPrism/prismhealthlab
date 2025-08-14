'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSignupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Preserve any redirect parameter
    const redirect = searchParams?.get('redirect');
    const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    router.replace(`/signup${redirectParam}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-300">Redirecting...</span>
      </div>
    </div>
  );
}