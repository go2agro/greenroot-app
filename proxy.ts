import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // ─────────────────────────────────────────
  // RULE 1 — Redirect logged in users away
  // from login/signup pages
  // ─────────────────────────────────────────
  if (user && (path === '/login' || path === '/signup')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else if (profile?.role === 'partner') {
      return NextResponse.redirect(new URL('/partner/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  // ─────────────────────────────────────────
  // RULE 2 — Protect student routes
  // ─────────────────────────────────────────
  if (path.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'student') {
      if (profile?.role === 'partner') {
        return NextResponse.redirect(new URL('/partner/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // ─────────────────────────────────────────
  // RULE 3 — Protect admin routes
  // ─────────────────────────────────────────
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      if (profile?.role === 'partner') {
        return NextResponse.redirect(new URL('/partner/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  // ─────────────────────────────────────────
  // RULE 4 — Protect partner routes
  // ─────────────────────────────────────────
  if (path.startsWith('/partner')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'partner') {
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  return response
}

// ─────────────────────────────────────────
// Which routes middleware runs on
// ─────────────────────────────────────────
  export const config = {
    matcher: [
      '/student/:path*',
      '/admin/:path*',
      '/partner/:path*',
      '/login',
      '/signup',
    ]
  }