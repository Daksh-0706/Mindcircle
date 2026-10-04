import { NextResponse } from 'next/server'

/**
 * Redeems a Google authorization code for tokens.
 *
 * This has to run server-side: exchanging an auth code for tokens with a
 * confidential client requires the client secret. Only the ID token is
 * returned to the browser — it is the credential Supabase verifies against
 * Google's JWKS, and it is useless to anyone without this project's session.
 *
 * PKCE is still enforced end to end: the verifier was generated in the browser
 * before the redirect and is checked here, so a stolen code cannot be
 * redeemed on its own.
 */
export async function POST(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Google sign-in is not configured on the server.' },
      { status: 500 },
    )
  }

  let code: unknown
  let codeVerifier: unknown
  try {
    const body = await request.json()
    code = body?.code
    codeVerifier = body?.code_verifier
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (
    typeof code !== 'string' ||
    !code ||
    typeof codeVerifier !== 'string' ||
    !codeVerifier
  ) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // The redirect URI has to match the one used on the authorization request
  // byte for byte, or Google rejects the exchange. It's derived from the
  // request's own origin so it is correct on localhost and on the deployed
  // domain without configuration.
  const origin = new URL(request.url).origin

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin}/auth/google/callback`,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenResponse.ok) {
    // Deliberately vague for the client; the details are logged server-side.
    console.error('google token exchange failed', tokenResponse.status, await tokenResponse.text())
    return NextResponse.json(
      { error: 'Google sign-in could not be completed. Please try again.' },
      { status: 502 },
    )
  }

  const tokens = (await tokenResponse.json()) as { id_token?: string }
  if (!tokens.id_token) {
    return NextResponse.json(
      { error: 'Google did not return an identity token.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ id_token: tokens.id_token })
}