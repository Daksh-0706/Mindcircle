'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use the implicit flow for OAuth: tokens arrive directly in the
        // callback URL hash, so there is no PKCE verifier to lose between
        // the sign-in click and the /auth/callback redirect.
        flowType: 'implicit',
      },
    },
  )
}
