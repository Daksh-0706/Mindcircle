import Skeleton from '@/components/ui/Skeleton'

/**
 * Route-level loading skeleton.
 *
 * Next.js streams a `loading.tsx` while a route's server component resolves.
 * Because every page in this app is a client component, the honest loading
 * state is the fetch-and-render one, so this mirrors the shape those pages
 * land on: a title block, a hero card, then a list of cards.
 *
 * `aria-busy` plus the visually hidden "Loading" text means screen readers
 * announce the transition instead of reading a wall of empty boxes.
 */
export default function RouteSkeleton({
  title = 'Loading',
  cards = 3,
}: {
  /** Names the section being loaded, for screen readers. */
  title?: string
  cards?: number
}) {
  return (
    <div
      className="page-enter mx-auto max-w-5xl px-4 sm:px-6 py-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>

      <Skeleton variant="text" width={200} height={28} />
      <span className="sr-only">{title}</span>

      <div className="mt-8 rounded-[24px] border border-warm-gray-lighter p-7 sm:p-9">
        <Skeleton variant="text" width={220} height={24} />
        <Skeleton variant="text" width="100%" height={14} className="mt-4" />
        <Skeleton variant="text" width="85%" height={14} className="mt-2.5" />
        <Skeleton variant="rect" width={160} height={44} className="mt-6" />
      </div>

      <div className="mt-6 space-y-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-[22px] border border-warm-gray-lighter p-4"
          >
            <Skeleton variant="circle" width={56} height={56} />
            <div className="flex-1 min-w-0">
              <Skeleton variant="text" width="45%" height={15} />
              <Skeleton variant="text" width="70%" height={12} className="mt-2.5" />
            </div>
            <Skeleton variant="rect" width={92} height={34} className="shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
