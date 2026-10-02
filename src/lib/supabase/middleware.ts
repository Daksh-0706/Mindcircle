import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Session refresh + route guarding, run request-scoped from src/proxy.ts.
 * Next.js 16 renamed Middleware to Proxy (same functionality).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAppRoute = pathname.startsWith('/app')
  // Onboarding is part of the signed-in journey, not the public one: it reads
  // the session to prefill the name and provision the profile row.
  const isOnboarding = pathname.startsWith('/onboarding')
  const isAuthLanding =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/landing')

  // Protect the authenticated app — send guests to login.
  // Remember where they were headed so login can return them there instead of
  // dumping them on the dashboard.
  if (!user && (isAppRoute || isOnboarding)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    // Only same-origin relative paths — never an absolute URL, or this
    // becomes an open redirect.
    url.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(url)
  }

  // Already signed in? Skip the landing/login/signup screens and continue to
  // wherever they were originally headed.
  if (user && isAuthLanding) {
    const next = request.nextUrl.searchParams.get('next')
    const url = request.nextUrl.clone()
    // Only allow a same-origin relative path. Without this check an attacker
    // could send someone to /login?next=https://evil.example and harvest the
    // post-login redirect.
    const safeNext =
      typeof next === 'string' &&
      next.startsWith('/') &&
      !next.startsWith('//') &&
      !next.startsWith('/\\')
        ? next
        : null

    if (safeNext) {
      url.pathname = safeNext.split('?')[0]
      const qIndex = safeNext.indexOf('?')
      url.search = qIndex === -1 ? '' : safeNext.slice(qIndex)
    } else {
      url.pathname = '/app'
      url.search = ''
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
