// One-off: point the code at the WebP files produced by
// convert-images-to-webp.mjs, and delete the superseded originals.
//
// Only files that are actually referenced from src/ are swapped. The large
// design sheets under public/ that nothing imports keep their original PNG
// (they are source artwork, not shipped payload) and their pointless WebP
// twin is removed.
import fs from 'node:fs'
import path from 'node:path'

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const manifest = JSON.parse(fs.readFileSync('scripts/image-conversion-manifest.json', 'utf8'))
const sourceFiles = [...walk('src'), 'next.config.ts']
const sourceText = () => sourceFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n')

const swapped = []
const orphans = []

for (const { from, to } of manifest) {
  const fromBase = path.basename(from)
  if (!sourceText().includes(fromBase)) {
    // Converted, but nothing in the app ever asked for it.
    if (fs.existsSync(path.join('public', to))) fs.unlinkSync(path.join('public', to))
    orphans.push(from)
    continue
  }

  let touched = 0
  for (const file of sourceFiles) {
    const before = fs.readFileSync(file, 'utf8')
    // Match the quoted path so a name that is a prefix of another asset
    // (journal-bg vs journal-bg-something) can never be half-rewritten.
    const after = before.replace(
      new RegExp(`(['"\`/])${fromBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`, 'g'),
      `$1${path.basename(to)}$2`,
    )
    if (after !== before) {
      fs.writeFileSync(file, after)
      touched += Number(after.match(new RegExp(path.basename(to), 'g'))?.length ?? 0)
    }
  }

  fs.unlinkSync(path.join('public', from))
  swapped.push({ from, to, touched })
}

console.log(`swapped ${swapped.length} references:`)
for (const s of swapped) console.log(`  ${s.from} -> ${s.to}`)
console.log()
console.log(`left untouched (not referenced, WebP twin removed) ${orphans.length}:`)
for (const o of orphans) console.log(`  ${o}`)
