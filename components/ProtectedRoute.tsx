"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';
import { getUser } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getUser();
        if (user) {
          setAuthorized(true);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
} 