// One-off audit: how much image weight actually reaches the browser.
// Lists every referenced asset over a threshold, largest first, so the
// mobile-critical payload is obvious instead of guessed at.
import fs from 'node:fs'
import path from 'node:path'

const THRESHOLD = Number(process.argv[2] ?? 80000)

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const assets = walk('public')
const sources = [...walk('src'), 'next.config.ts']
const corpus = sources.map((f) => fs.readFileSync(f, 'utf8')).join('\n')

let total = 0
let referencedTotal = 0
const rows = []
for (const file of assets) {
  const size = fs.statSync(file).size
  const url = '/' + file.slice('public/'.length).split(path.sep).join('/')
  const referenced = corpus.includes(path.basename(file))
  total += size
  if (referenced) referencedTotal += size
  rows.push({ url, size, referenced })
}

rows.sort((a, b) => b.size - a.size)

let flagged = 0
console.log(`Referenced assets over ${(THRESHOLD / 1024).toFixed(0)} KB:`)
for (const r of rows) {
  if (!r.referenced || r.size < THRESHOLD) continue
  flagged += r.size
  console.log(`${(r.size / 1024).toFixed(0).padStart(6)} KB  ${r.url}`)
}
console.log(`  => ${(flagged / 1048576).toFixed(2)} MB in referenced heavy assets`)
console.log()
console.log(
  `public/ total ${(total / 1048576).toFixed(1)} MB · referenced total ` +
    `${(referencedTotal / 1048576).toFixed(1)} MB`,
)
const orphans = rows.filter((r) => !r.referenced)
console.log(
  `unreferenced: ${orphans.length} files, ${(orphans.reduce((s, r) => s + r.size, 0) / 1048576).toFixed(1)} MB`,
)
