/**
 * FAQ content, kept separate from the component so the visible page and the
 * FAQPage structured data (Google rich results) can never drift apart. A schema
 * that disagrees with the visible text is a manual-action risk, so both read
 * from this one list.
 */
export const faqs = [
  {
    q: 'How private is my journal?',
    a: 'Completely. Your journal entries and mood check-ins are stored securely and are visible only to you — never to other members, counsellors, or even moderators. The "Private Journal" page is locked by default, and nothing you write there is ever shared, matched, or used in community spaces. You can confirm this anytime from Settings → Privacy.',
  },
  {
    q: 'How does anonymous sharing work?',
    a: 'When you post a story or join a discussion room, MindCircle shows an auto-generated alias instead of your name — no one, including us, links your posts back to you in the community. Your journal, mood history, and identity are never attached to anything you share publicly. You can see your alias on your profile page.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes. You stay in control of your data at all times. Deleting your account permanently removes your profile, journal entries, mood logs, stories, and connections — with no recovery period. If you would like to delete your account, contact us through the Contact Support page and we will process it for you.',
  },
  {
    q: 'How do I contact a counsellor?',
    a: 'Visit the Counsellors page to browse profiles of licensed professionals. Each counsellor lets you book a session or send a question directly from their profile. Counsellor booking opens once verification is complete — until then, profiles are shown in preview mode. In the meantime, peer rooms and Crisis Support are available 24/7.',
  },
  {
    q: 'What happens in a crisis or emergency?',
    a: 'Open the Crisis Support page from the sidebar. It stays reachable without logging in, so you never have to sign up while in distress. It gives one-tap access to 24/7 helplines (iCall, the Vandrevala Foundation and AASRA), a guided breathing exercise to settle your body, and a gentle fact sheet on understanding anxiety. If you or someone else is in immediate danger, call 112 or go to the nearest emergency room first — do not wait for an app.',
  },
  {
    q: 'How do mood check-ins and insights work?',
    a: 'Whenever you log a mood — from your dashboard or the journal — MindCircle records it with a timestamp. Over time, the Insights page turns these into patterns: how your mood trends across days, what you were journaling about, and how active you have been. It is a gentle mirror, not a diagnosis.',
  },
  {
    q: 'Are my stories really deleted after 24 hours?',
    a: 'Yes. Stories are designed to be ephemeral — like a moment, not a permanent post. Every story automatically disappears 24 hours after you share it, and you can also delete your own story at any time using the Delete button on it. Likes on a story disappear along with it.',
  },
  {
    q: 'Is MindCircle a replacement for therapy?',
    a: 'No. MindCircle is a support tool — journaling, mood tracking, peer circles, and wellbeing activities are there to help you reflect and feel less alone. It is not medical care and does not replace a licensed professional. If you are struggling beyond what peer support covers, the Counsellors page and Crisis Support page are the right next steps.',
  },

  /* ── Second batch ────────────────────────────────────────────
     Same rules as above: every answer here describes something the
     app actually does, and anything planned is described as
     planned. These were added for search visibility, so they target
     the questions people actually type into Google. */

  {
    q: 'Is my journal end-to-end encrypted?',
    a: 'No, and we would rather say so plainly than overstate it. Journal entries are stored in an encrypted database with row-level security, and they are readable only by you — not by other members, not by moderators. But data at rest encryption is not the same as end-to-end encryption, where only you hold the key. We describe the protection we have honestly rather than using a bigger word for it.',
  },
  {
    q: 'Who can see my mood history and journal?',
    a: 'Only you. Mood check-ins and journal entries are tied to your account and are never shown in community spaces, never attached to a story you post, and never shared with another member. If you turn on mood sharing, a connected person sees an aggregated trend — a gentle summary of how your mood has moved over time, not the individual entries with their notes.',
  },
  {
    q: 'What does my alias reveal about me?',
    a: 'Nothing. Your alias is generated for you, and community spaces show that instead of your name. Your journal, mood history and connections stay behind it. Your display name is yours to set and only appears on your own profile.',
  },
  {
    q: 'Can someone find me by searching my email or real name?',
    a: 'The directory search matches your alias, display name, location and bio — not your email address. Your email is used for sign-in and is never shown to other members or returned by the people-listing API. A display name is optional and may be shared by several people, so it is not something to rely on for privacy.',
  },
  {
    q: 'Can I make my profile private?',
    a: 'Yes, and it is your choice during setup. A private profile shows only your alias and avatar to people who are not connected with you — your bio, location, interests, goals and mood trends are not sent to their browser at all. You can change the setting later in Settings.',
  },
  {
    q: 'What happens when I block someone?',
    a: 'They disappear from your discovery list, your connections and your chat threads, and you will not be able to find or message each other again. Blocking also removes an existing connection. Blocking is immediate and does not need the other person to know.',
  },
  {
    q: 'How does reporting work?',
    a: 'Every profile has a Report option in the menu. Tell us what happened, and we review it. You can report the same person only once, so you do not have to keep resubmitting while we look into it.',
  },
  {
    q: 'Is MindCircle free?',
    a: 'Yes. There is no paid tier and no feature behind a paywall. It is built by a small team and supported by the people who use it.',
  },
  {
    q: 'How do I delete my account and my data?',
    a: 'You stay in control. Use Delete account in Settings and your profile, journal entries, mood logs, stories and connections are permanently removed, with no recovery period. You can also delete any single journal entry or story yourself at any time, without contacting us.',
  },
  ] as const