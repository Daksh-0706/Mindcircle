// One-off: re-encode the site's raster artwork as WebP at its native pixel
// size. These are large soft pastel illustrations stored as ~1.5 MB PNGs; a
// phone downloads and decodes every one of them, which is most of the "heavy"
// feeling. Dimensions are deliberately unchanged so nothing shifts visually —
// only the bytes and the decode cost go down.
//
// Kept as PNG on purpose:
//   og-image.png      social scrapers handle WebP inconsistently
//   logo-square.png   Web App Manifest icon (type is declared image/png)
//   icon-*.png / apple-icon.png / favicon*   browser + OS icon pickers
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

/** Per-file quality overrides; everything else uses DEFAULT_QUALITY. */
const QUALITY = {
  'logo.png': 92,
  'notfound-404.png': 88,
  'notfound-dancer.webm': 92,
}
const DEFAULT_QUALITY = 80

/** Format/type declarations that must stay PNG. */
const KEEP_PNG = new Set([
  'og-image.png',
  'logo-square.png',
  'icon-192.png',
  'icon-512.png',
  'apple-icon.png',
  'favicon.ico',
])

const CONVERTIBLE = /\.(png|jpe?g)$/i

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const converted = []
const skipped = []
let before = 0
let after = 0

for (const file of walk('public')) {
  const rel = path.relative('public', file).split(path.sep).join('/')
  const base = path.basename(file)
  if (!CONVERTIBLE.test(file)) continue
  if (KEEP_PNG.has(base) || rel.startsWith('emojis/')) {
    skipped.push([rel, 'kept as PNG'])
    continue
  }

  const outFile = file.replace(/\.(png|jpe?g)$/i, '.webp')
  const srcSize = fs.statSync(file).size
  const quality = QUALITY[rel] ?? DEFAULT_QUALITY

  await sharp(file)
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(outFile)

  const outSize = fs.statSync(outFile).size
  // Only swap when the WebP is a genuine win, so a tiny already-optimised
  // PNG is not replaced by something marginally larger.
  if (outSize < srcSize * 0.9) {
    const meta = await sharp(outFile).metadata()
    converted.push({ rel, out: path.relative('public', outFile).split(path.sep).join('/'), srcSize, outSize, meta })
    before += srcSize
    after += outSize
  } else {
    fs.unlinkSync(outFile)
    skipped.push([rel, `webp not smaller (${(outSize / 1024).toFixed(0)} KB)`])
  }
}

converted.sort((a, b) => b.srcSize - a.srcSize)
console.log('converted:')
for (const c of converted) {
  console.log(
    `${(c.srcSize / 1024).toFixed(0).padStart(6)} KB -> ${(c.outSize / 1024).toFixed(0).padStart(5)} KB  ` +
      `${String(c.meta.width)}x${String(c.meta.height)}  ${c.rel}  =>  ${c.out}`,
  )
}
console.log()
console.log(`kept / skipped (${skipped.length}):`)
for (const [rel, why] of skipped) console.log(`  ${rel}  — ${why}`)
console.log()
console.log(
  `total ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB ` +
    `(${(100 - (after / before) * 100).toFixed(0)}% smaller) across ${converted.length} files`,
)

// Machine-readable hand-off for the reference rewrite, so the sed step is
// driven by what actually happened rather than a hand-kept list.
fs.writeFileSync(
  'scripts/image-conversion-manifest.json',
  JSON.stringify(converted.map((c) => ({ from: c.rel, to: c.out })), null, 2),
)
