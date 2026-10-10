// Verifies the asset swap through the real HTTP interface: crawl the pages,
// pull every image/asset URL out of the HTML *and* out of the client bundles
// that those pages load, then fetch each one and assert it resolves with an
// image content type. Catches a broken reference that a grep cannot.
//
// Every built client chunk is scanned as well, not just the ones an anonymous
// crawl can reach — the /app screens sit behind auth and redirect before they
// ship any HTML, but their bundle still names the artwork they need.
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:3100'

const ROUTES = [
  '/',
  '/landing',
  '/login',
  '/signup',
  '/onboarding',
  '/blog',
  '/blog/exam-stress',
  '/privacy',
  '/terms',
  '/this-route-does-not-exist',
]

const ASSET_RE = /["'(\s](\/[A-Za-z0-9._@/-]+\.(?:webp|png|jpe?g|svg|gif|webm|ico|avif))(?=["')\s])/g
const CHUNK_RE = /["'](\/_next\/static\/[^"']+\.js)["']/g

const found = new Map() // url -> Set of pages that referenced it
function note(url, where) {
  if (!found.has(url)) found.set(url, new Set())
  found.get(url).add(where)
}

const failures = []

for (const route of ROUTES) {
  const res = await fetch(BASE + route, { redirect: 'manual' })
  const html = res.headers.get('content-type')?.includes('text/html') ? await res.text() : ''
  for (const m of html.matchAll(ASSET_RE)) note(m[1], route)

  // The client bundles are where the /app screens keep their image paths.
  const chunks = new Set([...html.matchAll(CHUNK_RE)].map((m) => m[1]))
  for (const chunk of chunks) {
    const js = await fetch(BASE + chunk)
    if (!js.ok) {
      failures.push(`${chunk} (bundle) -> HTTP ${js.status}`)
      continue
    }
    for (const m of (await js.text()).matchAll(ASSET_RE)) note(m[1], `${route} bundle`)
  }
  console.log(`crawled ${route.padEnd(28)} html=${(html.length / 1024).toFixed(0)}KB chunks=${chunks.size}`)
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (p.endsWith('.js')) out.push(p)
  }
  return out
}

const builtChunks = walk('.next/static/chunks')
for (const file of builtChunks) {
  for (const m of readFileSync(file, 'utf8').matchAll(ASSET_RE)) note(m[1], path.basename(file))
}
console.log(`\nscanned ${builtChunks.length} built client chunks on disk`)

console.log(`\nchecking ${found.size} distinct asset URLs...`)
let bytes = 0
for (const [url, pages] of [...found].sort()) {
  const res = await fetch(BASE + url, { method: 'GET' })
  const type = res.headers.get('content-type') ?? ''
  const body = await res.arrayBuffer()
  bytes += body.byteLength
  const ok = res.ok && /^(image|video|font|application\/octet-stream)/.test(type)
  if (!ok) failures.push(`${url} -> HTTP ${res.status} ${type} (from ${[...pages].join(', ')})`)
  console.log(
    `  ${res.ok ? 'OK ' : 'BAD'} ${String(res.status)} ${type.padEnd(16)} ` +
      `${(body.byteLength / 1024).toFixed(0).padStart(5)} KB  ${url}`,
  )
}

console.log(`\ntotal referenced asset bytes: ${(bytes / 1048576).toFixed(2)} MB`)
if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`)
  for (const f of failures) console.log('  ' + f)
  process.exitCode = 1
} else {
  console.log('\nall referenced assets resolved with an image/video content type')
}
