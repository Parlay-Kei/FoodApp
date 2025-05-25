"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('Please login to access this page');
          router.push('/login');
          return;
        }
        
        // If adminOnly is true, check if user is an admin
        if (adminOnly) {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
            
          if (error || !data || !data.is_admin) {
            toast.error('You do not have permission to access this page');
            router.push('/menu');
            return;
          }
        }
        
        setAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [adminOnly, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return authorized ? children : null;
}
