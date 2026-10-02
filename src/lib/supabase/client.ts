'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // PKCE (the default) is what this project's Supabase instance actually
        // uses — the authorize endpoint comes back with response_type=code.
        //
        // It was previously pinned to 'implicit' on the belief that a PKCE
        // verifier could be "lost between the sign-in click and the redirect".
        // That isn't how it works: the verifier is written to localStorage by
        // this same client and read back on return, in the same browser
        // context. Keeping implicit here only misdescribed the real flow, and
        // implicit puts session tokens in the URL fragment where they can leak
        // via screenshots, history and Referer headers.
        //
        // /auth/callback exchanges the ?code= for a session and then scrubs
        // the URL.
        flowType: 'pkce',
      },
    },
  )
}