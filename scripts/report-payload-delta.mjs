// Reports what each screen used to pull versus what it pulls now. Old sizes
// come from git (the originals are still in HEAD), new sizes from the files on
// disk, so both numbers are measured rather than estimated.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const SCREENS = {
  'every /app page (shell)': ['sidebar-bg'],
  'home (/app)': ['hero-sunset', 'private-room', 'journal-book'],
  'journal list': ['journal-bg', 'journal-book'],
  'journal entry': ['journal-bg', 'journal-book'],
  chats: ['chats-header', 'chat-card-heart', 'chat-card-night', 'chat-card-morning', 'chat-card-green', 'chat-card-study', 'chat-card-default'],
  connect: ['connect-hero', 'connect-card-purple', 'connect-card-pink', 'connect-card-blue', 'connect-card-green'],
  insights: ['insights-header', 'insights-chart-bg', 'insights-dist-bg', 'insights-stat-purple', 'insights-stat-blue', 'insights-stat-peach', 'insights-stat-green'],
  activities: ['activities/meditation', 'activities/journaling', 'activities/breathing', 'activities/nature-walk', 'activities/creative', 'activities/detox', 'activities/anxiety-relief', 'activities-cta-bg'],
  counsellors: ['counsellors-hero', 'counsellors-preview', 'counsellor-card-ananya', 'counsellor-card-rhea'],
  crisis: ['crisis-hero'],
  settings: ['settings-leaves'],
  'about (help)': ['about-hero-art', 'about-why', 'about-how', 'about-next', 'about-say-hello', 'about-dk-corner', 'about-dk-bottom'],
  onboarding: ['onboarding/bg-plain'],
  'landing + auth': ['logo'],
  '404 page': ['notfound-404', 'notfound-cloud-left', 'notfound-right', 'notfound-leaves'],
}

const oldSize = (base) => {
  for (const ext of ['png', 'jpg']) {
    try {
      return Number(execFileSync('git', ['cat-file', '-s', `HEAD:public/${base}.${ext}`], { encoding: 'utf8' }).trim())
    } catch {
      /* not a PNG or not in HEAD */
    }
  }
  return 0
}

const newSize = (base) => {
  for (const ext of ['webp', 'png', 'jpg']) {
    const p = `public/${base}.${ext}`
    if (fs.existsSync(p)) return fs.statSync(p).size
  }
  return 0
}

const kb = (n) => (n / 1024).toFixed(0).padStart(5)

let oldAll = 0
let newAll = 0
console.log('screen                        before     after    saved')
console.log('─'.repeat(56))
for (const [screen, assets] of Object.entries(SCREENS)) {
  const o = assets.reduce((s, a) => s + oldSize(a), 0)
  const n = assets.reduce((s, a) => s + newSize(a), 0)
  oldAll += o
  newAll += n
  console.log(
    `${screen.padEnd(28)}${kb(o)} KB ${kb(n)} KB ${kb(o - n)} KB  (${o ? (100 - (n / o) * 100).toFixed(0) : 0}% lighter)`,
  )
}
console.log('─'.repeat(56))
console.log(
  `${'all artwork'.padEnd(28)}${kb(oldAll)} KB ${kb(newAll)} KB ${kb(oldAll - newAll)} KB  ` +
    `(${(100 - (newAll / oldAll) * 100).toFixed(1)}% lighter)`,
)
