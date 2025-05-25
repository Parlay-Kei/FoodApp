import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Skip middleware for static assets and API routes to prevent potential errors
  const url = req.nextUrl.clone();
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('.') ||
    url.pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  try {
    const res = NextResponse.next();
    
    // Create Supabase client with error handling
    let supabase;
    try {
      supabase = createMiddlewareClient({ req, res });
    } catch (clientError) {
      console.error('Error creating middleware Supabase client:', clientError);
      return NextResponse.next();
    }

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
     * Only run middleware on routes that require authentication
     * This helps prevent unnecessary Supabase calls
     */
    '/menu/:path*',
    '/cart/:path*',
    '/order-history/:path*',
    '/order-status/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
