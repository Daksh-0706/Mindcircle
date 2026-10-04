/**
 * Google sign-in through our *own* Google OAuth client, instead of Supabase's
 * hosted proxy.
 *
 * Why: with `signInWithOAuth({ provider: 'google' })` the consent screen says
 * "to continue to btamknquiykxyjmutoki.supabase.co", because Google is talking
 * to Supabase's authorize endpoint. Pointing the authorization request at
 * Google directly makes the consent screen show this app's own domain
 * (mindcircle.vercel.app) instead.
 *
 * We still ask Supabase to issue and validate the session, but not by handing
 * it the auth code. Supabase's own PKCE endpoint redeems the code with *its*
 * Google client, which fails for a code issued to ours, so the code is
 * exchanged here instead — in a server route that holds the client secret —
 * and only the resulting ID token is handed to `signInWithIdToken`. Supabase
 * verifies that token against Google's JWKS and issues its own session, so
 * JWTs, refresh and the auth.users row keep working exactly as before.
 *
 * The client secret is server-only and never reaches the browser; PKCE still
 * protects the code exchange in transit.
 *
 * This requires registering this same Google client in Supabase
 * (Authentication → Providers → Google), so the ID token's audience is one
 * Supabase accepts.
 * Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable this. When it is absent the app
 * falls back to the Supabase-hosted flow, so a missing key degrades to the old
 * behaviour rather than breaking sign-in.
 */

const VERIFIER_KEY = 'mindcircle-google-pkce-verifier'
const NEXT_KEY = 'mindcircle-google-next'

/** Set to true once NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured. */
export const GOOGLE_DIRECT_AUTH_AVAILABLE = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
)

function base64UrlEncode(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * A PKCE verifier is 43–128 chars of unreserved characters; 32 random bytes
 * base64url-encoded lands at 43, the minimum, which is fine.
 */
function randomVerifier() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

async function challengeFor(verifier: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  )
  return base64UrlEncode(new Uint8Array(digest))
}

/** Where Google sends the user back to; must be registered on the client. */
export function googleRedirectUri() {
  return `${window.location.origin}/auth/google/callback`
}

/**
 * Sends the browser to Google's consent screen. Remembers where to land
 * afterwards, since the callback URL Google returns carries only the code.
 */
export async function startGoogleDirectSignIn(nextPath = '/app') {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Google sign-in is not configured.')

  const verifier = randomVerifier()
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  sessionStorage.setItem(NEXT_KEY, nextPath)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    // Keeps a signed-in Google user from being asked to pick an account again.
    prompt: 'select_account',
    code_challenge: await challengeFor(verifier),
    code_challenge_method: 'S256',
  })

  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}

/** Where the callback should send the user once a session exists. */
export function takeGoogleNextPath() {
  const next = sessionStorage.getItem(NEXT_KEY)
  sessionStorage.removeItem(NEXT_KEY)
  return next?.startsWith('/') && !next.startsWith('//') ? next : '/app'
}

/**
 * Trades Google's auth code for a Google ID token and asks Supabase to turn
 * it into a session.
 *
 * The code exchange happens in `/api/auth/google/exchange`, which holds the
 * client secret; this function only ever sees the resulting ID token, which is
 * safe to handle in the browser.
 *
 * Returns the signed-in user's id, or throws with something showable.
 */
export async function exchangeGoogleCode(code: string) {
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  sessionStorage.removeItem(VERIFIER_KEY)

  if (!verifier) throw new Error('Sign-in expired. Please try again.')

  const response = await fetch('/api/auth/google/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: verifier }),
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.error ?? 'Google sign-in could not be completed.')
  }

  const { id_token: idToken } = (await response.json()) as { id_token: string }
  if (!idToken) throw new Error('Google did not return an identity token.')

  // Imported lazily so this module stays usable outside a React tree.
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  })
  if (error) {
    // Almost always means this Google client isn't registered in Supabase,
    // so the ID token's audience is rejected. That message is worth showing
    // verbatim — it is the only clue that fixes it.
    throw new Error(error.message)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No user after sign-in.')

  return user.id
}