import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - with error handling
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if user exists but doesn't have a profile - with error handling
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          // If profile doesn't exist, we'll create it in the route handler
          // This is just a check to log the issue
          if (error && error.code === 'PGRST116') {
            console.log('Profile not found for user:', session.user.id);
            // The actual profile creation will happen in the API routes
          }
        } catch (profileError) {
          console.error('Error checking profile:', profileError);
          // Continue execution even if profile check fails
        }
      }
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      // Continue execution even if session check fails
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a response even if middleware fails
    return NextResponse.next();
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
