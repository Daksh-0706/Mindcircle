// One-off follow-up to convert-images-to-webp.mjs, for the two assets that are
// still oversized relative to how large they are actually drawn:
//
//   logo.webp        1024x568 for a mark never rendered above 144 CSS px wide
//   emojis/*.png     512x512 for a mood face drawn at ~40 CSS px
//
// The emoji pass only touches the six files the app really loads; the rest of
// public/emojis is unused artwork and is left exactly as it is.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

// ── 1. Logo: 512 wide is still ~2x the largest DPR-3 draw (144 * 3 = 432). ──
const LOGO = 'public/logo.webp'
if (fs.existsSync(LOGO)) {
  const before = fs.statSync(LOGO).size
  // Fed from memory rather than the path: libvips keeps a path-based source
  // mapped on Windows, which makes overwriting the same file fail with EPERM.
  const buf = await sharp(fs.readFileSync(LOGO))
    .resize({ width: 512, withoutEnlargement: true })
    .webp({ quality: 92, effort: 6 })
    .toBuffer()
  const tmp = `${LOGO}.tmp`
  fs.writeFileSync(tmp, buf)
  fs.rmSync(LOGO, { force: true })
  fs.renameSync(tmp, LOGO)
  const meta = await sharp(fs.readFileSync(LOGO)).metadata()
  console.log(
    `logo.webp  ${(before / 1024).toFixed(0)} KB -> ${(buf.length / 1024).toFixed(0)} KB  ` +
      `(${meta.width}x${meta.height})`,
  )
} else {
  console.log('logo.webp not found — skipping')
}

// ── 2. Mood emojis: referenced by path from src/lib/constants.ts. ───────────
const EMOJIS = ['happy', 'peaceful', 'neutral', 'frustrated', 'anxious', 'sad']
let emojiBefore = 0
let emojiAfter = 0
for (const name of EMOJIS) {
  const src = `public/emojis/${name}.png`
  const out = `public/emojis/${name}.webp`
  if (!fs.existsSync(src)) {
    console.log(`emojis/${name}.png already converted`)
    continue
  }
  await sharp(src).webp({ quality: 84, effort: 6 }).toFile(out)
  const a = fs.statSync(src).size
  const b = fs.statSync(out).size
  emojiBefore += a
  emojiAfter += b
  console.log(
    `emojis/${name}.png  ${(a / 1024).toFixed(0)} KB -> ${(b / 1024).toFixed(0)} KB`,
  )
}
if (emojiBefore) {
  console.log(
    `emoji total ${(emojiBefore / 1024).toFixed(0)} KB -> ${(emojiAfter / 1024).toFixed(0)} KB`,
  )
}
