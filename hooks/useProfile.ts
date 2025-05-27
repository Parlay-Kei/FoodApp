import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';

interface Profile {
  id: string;
  email?: string;
  phone?: string;
  is_admin?: boolean;
  receive_sms?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Fetch the user's profile
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Try to get the user's profile
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw profileError;
      }

      // If profile doesn't exist, create it
      if (!data) {
        await createProfile(user.id, user.email);
        return;
      }

      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Create a new profile
  const createProfile = async (userId: string, email?: string) => {
    try {
      // First try the direct approach
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          { id: userId, email: email || null }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        
        // If direct insert fails, try using the API endpoint
        const response = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: userId, email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create profile via API');
        }

        const apiData = await response.json();
        setProfile(apiData.profile);
        return apiData.profile;
      }

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error in profile creation:', err);
      setError(err.message || 'Failed to create profile');
      throw err;
    }
  };

  // Update the user's profile
  const updateProfile = async (updates: Partial<Profile>) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      toast.success('Profile updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    fetchProfile();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    createProfile
  };
};
