import { createUserProfile, createSupabaseClient } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Safely create Supabase client with error handling
    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch (clientError) {
      console.error('Error creating Supabase client:', clientError);
      return Response.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    // Safely get session with error handling
    let session;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return Response.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }
    
    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { user } = session;
    
    // Safely parse request body with error handling
    let phone;
    try {
      const body = await request.json();
      phone = body.phone;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return Response.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    // Create or update user profile with error handling
    try {
      const { data, error } = await createUserProfile(user.id, user.email, phone);
      
      if (error) {
        console.error('Error creating profile:', error);
        return Response.json({ error: error.message }, { status: 500 });
      }
      
      return Response.json({ profile: data });
    } catch (profileError) {
      console.error('Profile creation error:', profileError);
      return Response.json({ error: 'Unable to create profile' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unhandled profile creation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Safely create Supabase client with error handling
    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch (clientError) {
      console.error('Error creating Supabase client:', clientError);
      return Response.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    // Safely get session with error handling
    let session;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return Response.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }
    
    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Safely fetch profile with error handling
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          try {
            const { data: newProfile, error: createError } = await createUserProfile(
              session.user.id,
              session.user.email
            );
            
            if (createError) {
              console.error('Error creating profile during GET:', createError);
              return Response.json({ error: createError.message }, { status: 500 });
            }
            
            return Response.json({ profile: newProfile });
          } catch (createProfileError) {
            console.error('Error creating profile during GET:', createProfileError);
            return Response.json({ error: 'Unable to create profile' }, { status: 500 });
          }
        }
        
        console.error('Error fetching profile:', error);
        return Response.json({ error: error.message }, { status: 500 });
      }
      
      return Response.json({ profile: data });
    } catch (fetchError) {
      console.error('Profile fetch operation error:', fetchError);
      return Response.json({ error: 'Unable to fetch profile data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unhandled profile fetch error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
