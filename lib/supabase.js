import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export const createSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be defined in environment variables');
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

// Create a service role client for admin operations that bypass RLS
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Service role client not available - missing environment variables');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
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
