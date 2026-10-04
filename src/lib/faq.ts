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
    a: 'Open the Crisis Support page from the sidebar. It gives you one-tap access to 24/7 helplines (iCall, Vandrevala Foundation, AASRA), a guided breathing exercise to calm your body, and a gentle fact sheet on understanding anxiety. If you or someone else is in immediate danger, always call emergency services (112) or go to the nearest emergency room first.',
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
] as const