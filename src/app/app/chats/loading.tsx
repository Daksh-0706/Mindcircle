import RouteSkeleton from '@/components/common/RouteSkeleton'

/** Streaming fallback while this route resolves. */
export default function Loading() {
  return <RouteSkeleton title="Chats" cards={4} />
}
