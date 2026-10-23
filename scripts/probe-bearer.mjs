// Throwaway probe: does createServerClient() honour an Authorization: Bearer
// header when there is no session cookie? A native Android client has no
// cookies, so the whole Option-B architecture depends on this.
import http from 'node:http'
import { createServerClient } from '@supabase/ssr'

const received = []
const server = http.createServer((req, res) => {
  received.push({ url: req.url, authorization: req.headers.authorization ?? null })
  res.writeHead(401, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ code: 401, msg: 'invalid JWT: token probe' }))
})

await new Promise((resolve) => server.listen(0, resolve))
const port = server.address().port

async function probe(label, globalHeaders) {
  received.length = 0
  const client = createServerClient(`http://127.0.0.1:${port}/auth/v1`, 'anon-key-probe', {
    ...(globalHeaders ? { global: { headers: globalHeaders } } : {}),
    cookies: { getAll: () => [], setAll: () => {} },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const { error } = await client.auth.getUser()
  console.log(`\n[${label}] getUser() error -> ${error?.message ?? 'null'}`)
  console.log(`[${label}] server saw ${received.length} request(s)`)
  for (const r of received) console.log(`   ${r.url}  authorization=${r.authorization}`)
}

await probe('no header', null)
await probe('with Bearer header', { Authorization: 'Bearer FAKE_NATIVE_TOKEN' })

server.close()
