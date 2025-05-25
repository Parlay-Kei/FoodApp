import { createUserProfile, createSupabaseClient } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { user } = session;
    const body = await request.json();
    const { phone } = body;
    
    // Create or update user profile
    const { data, error } = await createUserProfile(user.id, user.email, phone);
    
    if (error) {
      console.error('Error creating profile:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ profile: data });
  } catch (error) {
    console.error('Profile creation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await createUserProfile(
          session.user.id,
          session.user.email
        );
        
        if (createError) {
          return Response.json({ error: createError.message }, { status: 500 });
        }
        
        return Response.json({ profile: newProfile });
      }
      
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ profile: data });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
