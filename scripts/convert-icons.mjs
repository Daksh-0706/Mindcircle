// Converts the lucide SVG icons the web uses into Android vector drawables.
//
// Lucide and Android agree on the essentials — a 24x24 viewport, a 2px stroke,
// round caps and joins — so the shapes carry over unchanged. What does NOT
// carry over is the path grammar: SVG lets arc flags run together ("a1 1 0 0 0-1-1")
// while Android's parser wants them comma-separated ("a1,1 0,0 0,-1,-1").
// Emitting arc flags by hand across ~19 icons is exactly the kind of thing that
// silently renders a blank box, so it is done properly here instead.
//
//   node scripts/convert-icons.mjs
//
// Writes res/drawable/ic_<name>.xml next to the app's other icons.

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT = 'android-app/app/src/main/res/drawable'

/** 24dp is the lucide viewport; keeping it identical keeps stroke weights true. */
const SIZE = 24

const ICONS = {
  home: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8|M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  journal: 'M12 5v16|M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z',
  connect: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|M16 3.128a4 4 0 0 1 0 7.744|M22 21v-2a4 4 0 0 0-3-3.87|c:9,7,4',
  discover: 'c:12,12,10|m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z',
  insights: 'M3 3v16a2 2 0 0 0 2 2h16|M18 17V9|M13 17V5|M8 17v-3',
  chats: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
  activities: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z|M20 2v4|M22 4h-4|c:4,20,2',
  counsellors: 'M11 2v2|M5 2v2|M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1|M8 15a6 6 0 0 0 12 0v-3|c:20,10,2',
  settings: 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915|c:12,12,3',
  crisis: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5',
  about: 'c:12,12,10|M12 16v-4|M12 8h.01',
  faq: 'c:12,12,10|M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3|M12 17h.01',
  support: 'c:12,12,10|m4.93 4.93 4.24 4.24|m14.83 9.17 4.24-4.24|m14.83 14.83 4.24 4.24|m9.17 14.83-4.24 4.24|c:12,12,4',
  profile: 'M10 15H6a4 4 0 0 0-4 4v2|m14.305 16.53.923-.382|m15.228 13.852-.923-.383|m16.852 12.228-.383-.923|m16.852 17.772-.383.924|m19.148 12.228.383-.923|m19.53 18.696-.382-.924|m20.772 13.852.924-.383|m20.772 16.148.924.383|c:18,15,3|c:9,7,4',
  password: 'r:3,11,18,11,2|M7 11V7a5 5 0 0 1 10 0v4',
  signout: 'm16 17 5-5-5-5|M21 12H9|M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
  chevron: 'm9 18 6-6-6-6',
  bell: 'M10.268 21a2 2 0 0 0 3.464 0|M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
  'user-plus': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|c:9,7,4|M19 8v6|M22 11h-6',

  // Settings sections, matching the web's SettingsClient section icons.
  check: 'M20 6 9 17l-5-5',

  // Activity detail screen — the icons the web's ActivityDetailClient uses.
  clock: 'c:12,12,10|M12 6v6h4',
  play: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z',
  pause: 'r:14,3,5,18,1|r:5,3,5,18,1',
  wind: 'M12.8 19.6A2 2 0 1 0 14 16H2|M17.5 8a2.5 2.5 0 1 1 2 4H2|M9.8 4.4A2 2 0 1 1 11 8H2',
  back: 'm12 19-7-7 7-7|M19 12H5',
  search: 'c:11,11,8|M21 21l-4.3-4.3',
  shield: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  sun: 'c:12,12,4|M12 2v2|M12 20v2|m4.93 4.93 1.41 1.41|m17.66 17.66 1.41 1.41|M2 12h2|M20 12h2|m6.34 17.66-1.41 1.41|m19.07 4.93-1.41 1.41',
  moon:
    'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2|c:12,7,4',
  mail: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7|r:2,4,20,16,2",
  eye: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0|c:12,12,3',
  smartphone: 'r:5,2,14,20,2|M12 18h.01',
  sparkles:
    'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z|M20 3v4|M22 5h-4',
  lock:
    'M5 11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z|M7 9V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20|M12 16v-4|M12 8h.01',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20|M9.1 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3|M12 17h.01',
  lifebuoy:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20|c:12,12,4|M4.93 4.93l4.24 4.24|M14.83 14.83l4.24 4.24|M14.83 9.17l4.24-4.24|M19.07 4.93l-4.24 4.24|M9.17 14.83l-4.24 4.24|M9.17 9.17l-4.24-4.24',
  chevron_right: 'm9 18 6-6-6-6',
  leaf:
    'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10|M2 21c0-3 1.85-5.36 5.08-6',
  chevron_left: 'm15 18-6-6 6-6',
  camera:
    'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z|c:12,13,3',
  trash:
    'M3 6h18|M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2|M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6|M10 11v6|M14 11v6',
  image:
    'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|c:8.5,8.5,1.5|M21 15l-5-5L5 21',
  avatar_camera:
    'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z|c:12,13,3',
  map_pin: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0|c:12,10,3',
  globe:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20|M2 12h20|M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20',
  text: 'M17 6.1H7|M5 6.1h12|v12.9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z',
  heart:
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  target:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20|c:12,12,4|M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  pencil:
    'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z|m15 5 4 4',
  zap: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
  switch_camera:
    'M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5|M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5|c:12,12,3|m18 22-3-3 3-3|m6 2 3 3-3 3',
}

/** Numbers are read positionally, so commands have to be matched to an arity. */
const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 }

/**
 * Re-emits SVG path data with explicit separators.
 *
 * Arc flags are the reason this exists: SVG allows `a1 1 0 0 0-1-1` while
 * Android wants `a1,1 0,0 0,-1,-1`. Flags are single digits in both, so they
 * get emitted on their own rather than comma-joined with the next number.
 */
/**
 * Re-emits SVG path data with explicit separators.
 *
 * This is a character scanner, not a regex sweep, because SVG arc flags are
 * single *characters*: in `a2 2 0 0022 17` the "0022" is three values —
 * largeArc=0, sweep=0, x=22. A greedy number regex reads that as 22 and the
 * icon renders as a blank box. So arcs get their own reader, and everything
 * else reads plain numbers.
 */
function toAndroidPathData(d) {
  let i = 0
  let out = ''

  const skipSep = () => {
    while (i < d.length && (d[i] === ' ' || d[i] === ',' || d[i] === '\t' || d[i] === '\n')) i += 1
  }

  const readNum = () => {
    skipSep()
    const start = i
    if (d[i] === '-' || d[i] === '+') i += 1
    // A number may hold one decimal point; a second '.' starts a new number
    // with no separator between them ("1.099.092" is 1.099 then 0.092).
    let seenDot = false
    while (i < d.length) {
      const c = d[i]
      if (c === '.') {
        if (seenDot) break
        seenDot = true
        i += 1
        continue
      }
      if (!/\d/.test(c)) break
      i += 1
    }
    const n = Number(d.slice(start, i))
    if (Number.isNaN(n)) throw new Error(`expected a number at ${start} in: ${d}`)
    return String(n)
  }

  const readFlag = () => {
    skipSep()
    const c = d[i]
    if (c !== '0' && c !== '1') throw new Error(`arc flag must be 0 or 1 at ${i} in: ${d}`)
    i += 1
    return c
  }

  /** Reads one full parameter set for `upper`, returning Android-safe text. */
  const readParams = (upper) => {
    if (upper === 'A') {
      const rx = readNum()
      const ry = readNum()
      const rot = readNum()
      const large = readFlag()
      const sweep = readFlag()
      const x = readNum()
      const y = readNum()
      // Flags are kept bare so Android never folds "0,0" into a single number.
      return `${rx},${ry} ${rot},${large},${sweep},${x},${y}`
    }
    const arity = ARITY[upper]
    if (arity === undefined) throw new Error(`unsupported command '${upper}' in: ${d}`)
    const vals = []
    for (let k = 0; k < arity; k += 1) vals.push(readNum())
    return vals.join(',')
  }

  while (i < d.length) {
    skipSep()
    if (i >= d.length) break

    const command = d[i]
    if (!/[a-zA-Z]/.test(command)) throw new Error(`expected a command at ${i} in: ${d}`)
    i += 1
    out += command

    const upper = command.toUpperCase()
    if (upper === 'Z') continue

    out += readParams(upper)

    // SVG lets a command repeat without re-stating the letter
    // ("l1,2 3,4" is two l's). Keep consuming parameter sets while the next
    // token is a number rather than a new command.
    for (;;) {
      const save = i
      skipSep()
      if (i >= d.length || /[a-zA-Z]/.test(d[i])) {
        i = save
        break
      }
      i = save
      // The leading space matters: without it the previous set's last number
      // and this set's first one fuse into a single wrong number.
      out += ` ${readParams(upper)}`
    }
  }
  return out
}

/** Android vector drawables have no <circle>, so it becomes a two-arc path. */
function circleToPath(cx, cy, r) {
  const f = (n) => Number(n.toFixed(4))
  return `M${f(cx - r)},${f(cy)}a${f(r)},${f(r)} 0,1 0,${f(2 * r)},0a${f(r)},${f(r)} 0,1 0,${f(-2 * r)},0z`
}

/** Nor <rect>; rounded corners become the same four-arc rounded rectangle. */
function rectToPath(x, y, w, h, rx) {
  const f = (n) => Number(n.toFixed(4))
  const r = f(rx)
  if (!r) return `M${f(x)},${f(y)}h${f(w)}v${f(h)}h${f(-w)}z`
  return (
    `M${f(x + r)},${f(y)}` +
    `h${f(w - 2 * r)}` +
    `a${r},${r} 0,0 1,${r},${r}` +
    `v${f(h - 2 * r)}` +
    `a${r},${r} 0,0 1,${-r},${r}` +
    `h${f(-(w - 2 * r))}` +
    `a${r},${r} 0,0 1,${-r},${-r}` +
    `v${f(-(h - 2 * r))}` +
    `a${r},${r} 0,0 1,${r},${-r}z`
  )
}

mkdirSync(OUT, { recursive: true })

let written = 0
for (const [name, spec] of Object.entries(ICONS)) {
  const paths = spec.split('|').map((part) => {
    if (part.startsWith('c:')) {
      const [cx, cy, r] = part.slice(2).split(',')
      return circleToPath(Number(cx), Number(cy), Number(r))
    }
    if (part.startsWith('r:')) {
      const [x, y, w, h, rx] = part.slice(2).split(',')
      return rectToPath(Number(x), Number(y), Number(w), Number(h), Number(rx))
    }
    return toAndroidPathData(part)
  })

  // A malformed path does not fail the build — it renders as a blank icon, or
  // (for an unparseable letter) takes the whole app down with
  // "Unknown command for: NaN". Nothing ships without passing this.
  const VALID_CHARS = new Set([...'MmLlHhVvCcSsQqTtAaZz', ...'0123456789.,- +'])
  for (const d of paths) {
    if (/NaN|undefined|Infinity/.test(d)) {
      throw new Error(`${name}: produced a non-finite path — ${d}`)
    }
    const offenders = [...new Set([...d].filter((c) => !VALID_CHARS.has(c)))]
    if (offenders.length) {
      throw new Error(
        `${name}: path contains ${JSON.stringify(offenders.join(''))}, which ` +
          `Android's PathParser rejects — ${d}`,
      )
    }
  }

  const body = paths
    .map(
      (d) =>
        `    <path\n` +
        `        android:pathData="${d}"\n` +
        `        android:strokeColor="#FF3D2A52"\n` +
        `        android:strokeWidth="2"\n` +
        `        android:strokeLineCap="round"\n` +
        `        android:strokeLineJoin="round" />`,
    )
    .join('\n')

  const xml =
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<!-- Lucide "${name}", the icon the web app uses for this entry.\n` +
    `     Generated by scripts/convert-icons.mjs — edit that, not this. -->\n` +
    `<vector xmlns:android="http://schemas.android.com/apk/res/android"\n` +
    `    android:width="${SIZE}dp"\n` +
    `    android:height="${SIZE}dp"\n` +
    `    android:viewportWidth="${SIZE}"\n` +
    `    android:viewportHeight="${SIZE}">\n` +
    `${body}\n` +
    `</vector>\n`

  writeFileSync(join(OUT, `ic_${name.replace(/-/g, '_')}.xml`), xml)
  written += 1
}

console.log(`wrote ${written} icons to ${OUT}`)