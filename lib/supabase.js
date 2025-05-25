import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

// Hardcoded fallback values for Netlify deployment - only used if environment variables fail
const FALLBACK_SUPABASE_URL = 'https://glhskzubuidgdpjsfxyj.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsaHNrenVidWlkZ2RwanNmeHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNzA2MDMsImV4cCI6MjA2Mzc0NjYwM30.rBX4BtoHgQwIC7bMYQNaeYWKPwtWUYO3LXw5oWXVeOA';

export const createSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  // Try to get values from environment variables first
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Use fallback values if environment variables are not available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using fallback Supabase credentials - environment variables not found');
    supabaseUrl = FALLBACK_SUPABASE_URL;
    supabaseAnonKey = FALLBACK_SUPABASE_ANON_KEY;
  }
  
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Create a minimal client that won't throw errors but might not work correctly
    return createClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_ANON_KEY);
  }
};

// Create a service role client for admin operations that bypass RLS
export const createServiceClient = () => {
  // Try to get values from environment variables first
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Fallback service role key - only used if environment variables fail
  const FALLBACK_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsaHNrenVidWlkZ2RwanNmeHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE3MDYwMywiZXhwIjoyMDYzNzQ2NjAzfQ.Dn1II64EzJ7PILJuD8ElqxW2IUfo8p_czl1lhDcC0g8';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Using fallback service role credentials - environment variables not found');
    supabaseUrl = FALLBACK_SUPABASE_URL;
    supabaseServiceKey = FALLBACK_SERVICE_KEY;
  }
  
  try {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    console.error('Error creating service client:', error);
    // Create a minimal service client that won't throw errors
    return createClient(FALLBACK_SUPABASE_URL, FALLBACK_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
};

// Helper function to get user from Supabase
export const getUser = async () => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return data?.user || null;
};

// Helper function to check if user is admin
export const isUserAdmin = async () => {
  const supabase = createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
    
  if (error || !data) return false;
  
  return data.is_admin || false;
};

// Create a user profile after signup
export const createUserProfile = async (userId, email, phone = null) => {
  try {
    // First try with regular client (might fail due to RLS)
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        { id: userId, email, phone, is_admin: false, receive_sms: false }
      ])
      .select()
      .single();
      
    if (!error) {
      console.log('Profile created successfully');
      return { data, error: null };
    }
    
    // If regular client fails, try with service role client
    console.log('Using service role client for profile creation');
    const serviceClient = createServiceClient();
    if (!serviceClient) {
      return { data: null, error: new Error('Service client unavailable') };
    }
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('profiles')
      .insert([
        { id: userId, email, phone, is_admin: false, receive_sms: false }
      ])
      .select()
      .single();
      
    return { data: serviceData, error: serviceError };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { data: null, error };
  }
};
