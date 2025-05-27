'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthStatus() {
  const [authState, setAuthState] = useState<{
    user: any | null;
    session: any | null;
    error: string | null;
  }>({
    user: null,
    session: null,
    error: null
  });

  useEffect(() => {
    const supabase = createClientComponentClient();

    const checkAuth = async () => {
      try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        console.log('Auth State:', { session, user });
        setAuthState({ user, session, error: null });
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({ user: null, session: null, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    };

    // Check immediately
    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        error: session ? null : prev.error // Clear error if a session exists
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-sm max-h-64 overflow-y-auto">
      <h3 className="font-bold mb-2">Auth Status:</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(authState, null, 2)}
      </pre>
    </div>
  );
} 