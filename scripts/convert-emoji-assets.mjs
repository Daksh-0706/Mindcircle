// One-off: the Noto emoji set in public/emojis is stored as 512x512 PNGs and
// drawn between 13 and 72 CSS px — a picker or an avatar grid can pull a few
// dozen of them in one screen. Same treatment as the rest of the artwork:
// re-encode as WebP at native size, so nothing about the rendering changes.
//
// Driven by the NOTO_EMOJIS map in NotoEmoji.tsx, which is the only thing that
// names these files; anything not in that map is unreferenced and untouched.
import fs from 'node:fs'
import sharp from 'sharp'

const MAP_FILE = 'src/components/ui/NotoEmoji.tsx'
const mapSource = fs.readFileSync(MAP_FILE, 'utf8')

const names = [...mapSource.matchAll(/'([a-z0-9-]+)\.png'/g)].map((m) => m[1])
const unique = [...new Set(names)]
console.log(`referenced emoji PNGs: ${unique.length}`)

let before = 0
let after = 0
const converted = []
for (const name of unique) {
  const src = `public/emojis/${name}.png`
  const out = `public/emojis/${name}.webp`
  if (!fs.existsSync(src)) {
    console.log(`  emojis/${name}.png missing on disk`)
    continue
  }
  await sharp(fs.readFileSync(src))
    .webp({ quality: 84, effort: 6 })
    .toFile(out)
  const a = fs.statSync(src).size
  const b = fs.statSync(out).size
  before += a
  after += b
  converted.push(name)
  console.log(`  ${name.padEnd(14)} ${(a / 1024).toFixed(0).padStart(4)} KB -> ${(b / 1024).toFixed(0)} KB`)
}
console.log(`total ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`)

fs.writeFileSync('scripts/emoji-conversion-manifest.json', JSON.stringify(converted, null, 2))
