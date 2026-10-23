// Throwaway probe 2: with only an Authorization header (no cookies), does the
// PostgREST side of the client carry the user JWT? RLS decides on this.
import http from 'node:http'
import { createServerClient } from '@supabase/ssr'

const received = []
const server = http.createServer((req, res) => {
  received.push({ url: req.url, authorization: req.headers.authorization ?? null, apikey: req.headers.apikey ?? null })
  if (req.url.includes('/auth/v1/user')) {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ id: 'u-123', aud: 'authenticated', email: 'probe@example.com', created_at: '2026-01-01T00:00:00Z' }))
  } else {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify([{ id: 'u-123' }]))
  }
})

await new Promise((resolve) => server.listen(0, resolve))
const port = server.address().port

const client = createServerClient(`http://127.0.0.1:${port}`, 'anon-key-probe', {
  global: { headers: { Authorization: 'Bearer FAKE_NATIVE_TOKEN' } },
  cookies: { getAll: () => [], setAll: () => {} },
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

const { data: userData, error: userError } = await client.auth.getUser()
console.log('getUser ->', userData?.user?.id ?? 'null', '| error:', userError?.message ?? 'none')

const { data: rows, error: restError } = await client.from('users').select('id').eq('id', 'u-123').maybeSingle()
console.log('rest query ->', JSON.stringify(rows), '| error:', restError?.message ?? 'none')

console.log('\nserver saw:')
for (const r of received) console.log(`  ${r.url}\n     authorization=${r.authorization}  apikey=${r.apikey}`)

server.close()
