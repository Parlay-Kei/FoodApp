'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';

export default function ProfileInitializer() {
  useEffect(() => {
    const initializeProfile = async () => {
      const supabase = createClientComponentClient();
      
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No user found, skipping profile initialization');
          return;
        }
        
        console.log('User found, attempting to fetch profile');
        
        // Try to fetch profile
        const response = await fetch('/api/auth/profile');
        const data = await response.json();
        
        if (response.ok) {
          console.log('Profile fetched successfully:', data);
        } else {
          console.error('Failed to fetch profile:', data.error);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    initializeProfile();
  }, []);
  
  return null; // This component doesn't render anything
} 