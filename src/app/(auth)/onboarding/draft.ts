/** The values collected across the four setup steps. */
export type Draft = {
  name: string
  location: string
  bio: string
  avatar: string
  /**
   * Whether anyone on Mindcircle can open this profile, or only people who
   * connect with them. Chosen in step 1 so it is never a hidden default.
   */
  isPublic: boolean
  /** Interest labels, e.g. 'Mental Health'. */
  interests: string[]
  /** Goal ids from GOALS. */
  goals: string[]
}

export type DraftPatch = Partial<Draft>
