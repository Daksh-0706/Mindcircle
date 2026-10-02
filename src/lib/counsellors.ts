export type Counsellor = {
  slug: string
  name: string
  specialty: string
  experience: string
  initials: string
  color: string
  bio: string
}

/**
 * Counsellor directory. Static content for now (not DB-backed) — both the
 * list page and the profile pages read from this single source so links
 * and details can never drift apart.
 */
export const COUNSELLORS: Counsellor[] = [
  {
    slug: 'dr-ananya-rao',
    name: 'Dr. Ananya Rao',
    specialty: 'Anxiety · Self-esteem · Students',
    experience: '12 years',
    initials: 'AR',
    color: 'bg-sage',
    bio: 'I create a warm, non-judgmental space where you can slow down, understand your patterns, and find practical ways forward.',
  },
  {
    slug: 'rhea-mehta',
    name: 'Rhea Mehta, M.A.',
    specialty: 'Students · Life transitions',
    experience: '8 years',
    initials: 'RM',
    color: 'bg-terracotta',
    bio: 'Change is hard even when it is good. I help students and young professionals navigate transitions with clarity and self-compassion.',
  },
]
export function counsellorBySlug(slug: string): Counsellor | undefined {
  return COUNSELLORS.find((c) => c.slug === slug)
}
