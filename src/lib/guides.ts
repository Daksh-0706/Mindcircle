/**
 * Public guide articles.
 *
 * These live in one module rather than inside the page components so that the
 * visible article, the sitemap entry and the meta description are generated
 * from the same source and can't drift apart.
 *
 * Editorial rules for anything added here:
 *  - Describe what the app actually does. Anything planned is described as
 *    planned.
 *  - No clinical claims. We are a peer-support and tracking tool, not a
 *    provider of medical care, so nothing here tells a reader to treat,
 *    diagnose or stop medication.
 *  - Anything about self-harm or crisis points at the Crisis Support page
 *    rather than trying to be a substitute for it.
 */

export type GuideSection = { heading: string; body: string[] }

export type Guide = {
  slug: string
  title: string
  /** Meta description — this is the text Google shows in the result. */
  description: string
  /** The one-line promise shown at the top of the article. */
  summary: string
  readingTime: string
  sections: GuideSection[]
  /** Crate voice, kept per-article so each section reads naturally. */
}

export const GUIDES: Guide[] = [
  {
    slug: 'exam-stress',
    title: 'How to handle exam stress: a practical routine for the week before',
    description:
      'A realistic, low-effort routine for the week before exams — sleep, study blocks, food, and what to do when your mind goes blank. Written for students.',
    summary:
      'The week before an exam is when most students feel worst, and it is usually the pressure of the *idea* of the exam rather than the exam itself. Here is a routine that survives bad days.',
    readingTime: '6 min read',
    sections: [
      {
        heading: 'Why exam stress feels bigger than the exam',
        body: [
          'In the days before an exam, the brain keeps rehearsing the worst outcome: running out of time, blanking out, everyone else finishing first. That rehearsal is what keeps you awake and distracted, and it feels like the exam has already gone badly — even though nothing has happened yet.',
          'This is why the usual advice ("just relax", "you will be fine") rarely helps. Relaxing is hard when your attention is locked on a threat. What does help is giving the worry a specific place to live, so it stops interrupting everything else.',
        ],
      },
      {
        heading: 'Two weeks out: stop starting new things',
        body: [
          'Add nothing new. No new notebook, no new study method discovered on a video at midnight, no new revision plan every evening. Every new system costs you the first day or two to set up, and during exams you do not have that to spare.',
          'Finish what you have started. Partial notes that cover eighty percent of the syllabus beat beautiful notes that cover half of it, because the exam is based on the syllabus, not on how your notes look.',
        ],
      },
      {
        heading: 'One week out: switch from topics to recall',
        body: [
          'Reading notes feels productive and is mostly not. Reading makes a topic *feel* familiar; being tested on it makes it *available*. Close the notes and write down everything you can remember about one chapter, then check what you missed. Repeat for the next chapter.',
          'If you can do this for half the syllabus, you are in decent shape for the exam. If you cannot, you have just found out what to study — which is exactly what you wanted to know.',
          'Stop studying at least a few hours before you sleep. Last-minute revision of a hard topic reliably produces the feeling of knowing less, not more, and it costs you sleep.',
        ],
      },
      {
        heading: 'The night before: boring wins',
        body: [
          'Do the same small things you would do on any normal night. Same dinner, same clothes, same time in bed. Predictability is calming precisely because it is unremarkable.',
          'Prepare the small logistics that secretly cost sleep: water by the bed, your hall ticket and pen in one place, alarms set, phone charging outside the room. Most exam-morning panic is really the panic of a small logistical problem discovered too late.',
          'If you cannot sleep, do not check the time. Lying awake and calculating how many hours are left is worse than the lost sleep. Close your eyes and let the rest happen; an hour less of sleep costs less than an hour of panic does.',
        ],
      },
      {
        heading: 'When your mind goes blank mid-question',
        body: [
          'This is extremely common and it is usually a signal of panic, not of not knowing the answer. Your working memory is overloaded, and it responds by refusing to retrieve.',
          'Write the keywords you *do* remember before you panic about the rest. Often your hand keeps writing long after your head gives up, and the answer comes back on its own. If it does not, mark it and move on — the points you can still claim are worth more than five minutes spent staring at one question.',
        ],
      },
      {
        heading: 'The day before, as a short checklist',
        body: [
          'Ask: when is my last exam? Which subject is that? That is the actual question most students should be asking, and it is almost always the weakest subject that deserves the morning before an exam, not the one you keep revising out of habit.',
          'Eat before you go in. A light meal is not a superstition; a low blood sugar makes concentration noticeably worse and the mistake happens.',
          'Sleep as much as you can. Being slightly under-slept is uncomfortable; being exhausted makes you clumsy with the questions you do know.',
        ],
      },
      {
        heading: 'After the exam',
        body: [
          'Whatever you remember feeling during the exam, you almost certainly did better than it felt. Recall is biased towards the moments you found hardest, which is not the same thing as the exam itself.',
          'Do not re-open the paper straight away if you can avoid it. The urge to check and revise is anxiety looking for something to do, not a reliable source of information.',
        ],
      },
    ],
  },
  {
    slug: 'help-a-friend',
    title: 'How to help a friend who is struggling with anxiety',
    description:
      'What to say, what not to say, and how to actually help a friend who is anxious — without making it about you or trying to fix them.',
    summary:
      'You do not have to be a therapist to help. Most of what matters is small: staying present, not rushing to fix, and knowing when to involve someone else.',
    readingTime: '5 min read',
    sections: [
      {
        heading: 'You do not need the right words',
        body: [
          'People worry that they will say the wrong thing and make it worse. In practice almost anything said sincerely lands fine. What helps is not elegance, it is that you are still there afterwards.',
          'The most useful thing is often the smallest: sitting with someone while they are upset, and not immediately filling the silence with advice.',
        ],
      },
      {
        heading: 'Things that usually help',
        body: [
          'Ask directly, once, and then let them answer at their own pace: "How are you doing, honestly?" Asking twice is what gets a real answer — the first "I\'m fine" is usually reflex, not information.',
          'Listen without steering. No interrupting with your own story, no listing what they should try, no "at least you have…". The experience of being heard is the thing that helps.',
          'Suggest something small and specific rather than "let\'s do something to take your mind off it". "Want to walk to the library with me?" is answerable; an open-ended evening plan is a lot to say no to.',
          'Keep showing up. Most people\'s anxiety does not resolve in one conversation. A message three days later saying "no pressure, just checking in" matters more than a long conversation that happened once.',
        ],
      },
      {
        heading: 'Things that quietly make it worse',
        body: [
          'Comparing. "You should try running" or "I was fine before my exams" ranks their experience against someone else\'s, and the only message it sends is that their struggle is illegitimate.',
          'Rushing to diagnose. Naming a disorder for them — anxiety, depression, ADHD — is not support, and being labelled by a friend can feel dismissive even when it is meant kindly.',
          'Promising secrecy you cannot keep. If your friend tells you they are having thoughts of harming themselves, you need to involve another adult. That is not breaking a promise; it is the one promise you must break.',
          'Making their recovery your project. Support means being available, not monitoring, not fixing, and not disappearing the day they seem better.',
        ],
      },
      {
        heading: 'Choosing the moment',
        body: [
          'If your friend is spiralling in a public place, do not start the deep conversation there. Walk with them somewhere quieter, or say plainly: "this is a bigger conversation than a corridor — can we find a coffee place?"',
          'If you are worried they might act on thoughts of self-harm, do not leave them alone and do not wait to see whether they improve. Contact the emergency helplines listed on the Crisis Support page, or 112 if there is immediate danger.',
        ],
      },
      {
        heading: 'Taking care of yourself too',
        body: [
          'Supporting someone who is anxious is not free. It can be draining, and it is normal to find it harder than expected.',
          'If this is weighing on you, talking to a counsellor or a trusted faculty member is not a betrayal of your friend. You cannot be the only support in a person\'s life.',
        ],
      },
    ],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}