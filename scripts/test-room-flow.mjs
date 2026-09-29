/**
 * End-to-end room flow test against the running dev server.
 * Creates a throwaway account, joins a room, reads messages, sends one.
 * Usage: node scripts/test-room-flow.mjs
 */
const BASE = 'http://127.0.0.1:59938'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  // .env.local is Next-format; load it manually.
  const fs = await import('node:fs')
  const env = fs.readFileSync('.env.local', 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim()
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const email = `flowtest-${Date.now()}@example.com`
const password = 'Flowtest123!'

console.log('1) Signup:', email)
const signupRes = await fetch(`${url}/auth/v1/signup`, {
  method: 'POST',
  headers: { 'apikey': anon, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const signupJson = await signupRes.json()
if (!signupRes.ok) {
  console.error('Signup failed:', signupJson)
  process.exit(1)
}
const accessToken = signupJson.access_token
const refreshToken = signupJson.refresh_token
console.log('   ok, user id:', signupJson.user?.id)

// @supabase/ssr stores the FULL session array as:
// sb-<ref>-auth-token = base64-<base64(JSON.stringify([session]))>
const projectRef = url.replace('https://', '').split('.')[0]
const sessionCookieName = `sb-${projectRef}-auth-token`
const sessionPayload =
  'base64-' +
  Buffer.from(JSON.stringify([signupJson])).toString('base64')

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Cookie: `${sessionCookieName}=${sessionPayload}`,
      ...(options.headers || {}),
    },
  })
  let body = null
  try { body = await res.json() } catch {}
  return { status: res.status, body }
}

console.log('2) GET /api/chat (rooms)')
const rooms = await api('/api/chat')
console.log('   status:', rooms.status, '| rooms:', rooms.body?.data?.length ?? rooms.body?.error)
if (rooms.status !== 200) process.exit(1)

const room = rooms.body.data[0]
console.log('   first room:', room.name, room.id)

console.log('3) GET /api/chat/messages (auto-join + read)')
const msgs1 = await api(`/api/chat/messages?room_id=${room.id}`)
console.log('   status:', msgs1.status, '| messages:', Array.isArray(msgs1.body?.data) ? msgs1.body.data.length : msgs1.body)

console.log('4) POST /api/chat/messages (send "hello from test")')
const send = await api('/api/chat/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ room_id: room.id, content: 'hello from test' }),
})
console.log('   status:', send.status, '|', send.body?.data?.[0]?.id ?? send.body)

console.log('5) GET again (message visible?)')
const msgs2 = await api(`/api/chat/messages?room_id=${room.id}`)
console.log('   status:', msgs2.status, '| messages:', Array.isArray(msgs2.body?.data) ? msgs2.body.data.length : msgs2.body)

console.log('\nDone — steps 3-5 sab 200 + message count badhna chahiye.')
