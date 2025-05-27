// Script to fix the profile RLS policy issue

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key (required for RLS bypass)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key in .env.local');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixProfileRLS() {
  console.log('Fixing profile RLS policies...');
  
  try {
    // 1. Add policy to allow users to insert their own profile
    const { error: insertPolicyError } = await supabase.rpc('create_profiles_insert_policy');
    
    if (insertPolicyError) {
      console.error('Error creating insert policy:', insertPolicyError);
      
      // Try direct SQL approach if RPC fails
      console.log('Trying direct SQL approach...');
      const { error: sqlError } = await supabase.query(`
        -- Allow users to create their own profile
        CREATE POLICY IF NOT EXISTS profiles_insert_own ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
      `);
      
      if (sqlError) {
        console.error('SQL error:', sqlError);
        return;
      }
    }
    
    // 2. Create a trigger to automatically create profiles for new users
    const { error: triggerError } = await supabase.query(`
      -- Create a function to handle new user creation
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, email)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      -- Create or replace the trigger
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `);
    
    if (triggerError) {
      console.error('Error creating trigger:', triggerError);
      return;
    }
    
    console.log('Successfully fixed profile RLS policies!');
    console.log('Users should now be able to create profiles without RLS errors.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixProfileRLS();
