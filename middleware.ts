import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { createServiceClient } from './lib/supabase';

export async function middleware(req) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - with error handling
    try {
      console.log('Middleware: Attempting to refresh session');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Middleware: Session error:', sessionError);
      } else if (session) {
        console.log('Middleware: Session found for user:', session.user.id);
        
        // Check if user exists but doesn't have a profile
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            if (profileError.code === 'PGRST116') {
              console.log('Middleware: Profile not found for user:', session.user.id);
              // Try to create profile using service role client
              const serviceClient = createServiceClient();
              if (!serviceClient) {
                console.error('Middleware: Service client unavailable');
                return res;
              }
              
              const { error: createError } = await serviceClient
                .from('profiles')
                .insert([
                  { 
                    id: session.user.id,
                    email: session.user.email,
                    is_admin: false,
                    receive_sms: false
                  }
                ]);
                
              if (createError) {
                console.error('Middleware: Failed to create profile:', createError);
              } else {
                console.log('Middleware: Profile created successfully using service role');
              }
            } else {
              console.error('Middleware: Profile check error:', profileError);
            }
          } else {
            console.log('Middleware: Profile found:', profile);
          }
        } catch (profileError) {
          console.error('Middleware: Error checking profile:', profileError);
        }
      } else {
        console.log('Middleware: No session found');
      }
    } catch (sessionError) {
      console.error('Middleware: Error getting session:', sessionError);
    }

    return res;
  } catch (error) {
    console.error('Middleware: Unhandled error:', error);
    return NextResponse.next();
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 