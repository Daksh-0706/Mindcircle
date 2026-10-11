import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  // cookies() is async in Next.js 16 — must be awaited.
  const cookieStore = await cookies()

  // Two kinds of client hit these route handlers:
  //
  //   1. The web app — a browser, which holds the Supabase session in cookies.
  //   2. The native Android app — which has no cookies and instead sends the
  //      access token in `Authorization: Bearer <jwt>`.
  //
  // Both are validated the same way: the token is handed to Supabase, whose
  // auth server answers whether it is real and unexpired. Neither header is
  // trusted on its own, and the database still applies Row Level Security to
  // every query below. See docs/ANDROID.md.
  const headerStore = await headers()
  const authorization = headerStore.get('authorization')
  const bearer = authorization?.toLowerCase().startsWith('bearer ')
    ? authorization.slice(7).trim()
    : undefined

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Absent for browser requests, so the cookie path is byte-for-byte what
      // it was before. Present for a native client, it is forwarded to
      // PostgREST (supabase.from(...) → RLS) on every request this client
      // makes, so database access stays gated by the token's own identity.
      ...(bearer
        ? { global: { headers: { Authorization: `Bearer ${bearer}` } } }
        : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component. Cookies can't be modified here —
            // session refresh is delegated to the request-scoped updateSession in
            // src/lib/supabase/middleware.ts via src/proxy.ts.
          }
        },
      },
    }
  )
}
