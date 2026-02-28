
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Check user session
    let user = null;
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            // AuthSessionMissingError is expected when user is not logged in
            if (error.name !== 'AuthSessionMissingError') {
                console.error('Auth error in middleware:', error);
            }
        } else {
            user = data.user;
        }
    } catch (err) {
        console.error('Network error in middleware:', err);
    }

    // Protect /profile route - only need login
    if (request.nextUrl.pathname.startsWith('/profile') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        
        // Simple role check
        if (user.user_metadata?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protect /editor routes
    if (request.nextUrl.pathname.startsWith('/editor') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (e) {
    console.error('Middleware error:', e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}
