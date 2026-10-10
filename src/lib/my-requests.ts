/**
 * Which connection requests *I* sent.
 *
 * `connections` stores each pair canonically (`user_a < user_b`) and has no
 * "who asked first" column, so the moment a row turns `accepted` the API can no
 * longer say whether they accepted my request or I accepted theirs. The bell
 * needs exactly that distinction — "X accepted your request" is only true for a
 * row we sent — so the connection id is written down when the request goes out.
 *
 * The id is also harvested from any row still sitting in `outgoing` during the
 * notification poll, which covers a request sent from another device or a race
 * where they accepted before this client's next tick.
 *
 * Keyed by connection id rather than person id on purpose: declining a request
 * deletes the row, so a later request from the same person carries a fresh id
 * and can never be mistaken for one of mine.
 */

const KEY = 'mindcircle:my-requests'

/** Hard ceiling so a long account cannot grow the entry without bound. */
const MAX = 200

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : []
  } catch {
    return []
  }
}

/** Records a request this client just sent. No-ops for empty/invalid ids. */
export function rememberMyRequests(connectionIds: Array<string | null | undefined>) {
  if (typeof window === 'undefined') return
  const ids = connectionIds.filter((x): x is string => typeof x === 'string' && x.length > 0)
  if (ids.length === 0) return
  try {
    const current = read()
    let changed = false
    for (const id of ids) {
      if (!current.includes(id)) {
        current.push(id)
        changed = true
      }
    }
    if (!changed) return
    window.localStorage.setItem(KEY, JSON.stringify(current.slice(-MAX)))
  } catch {
    // Storage blocked or full — the poll backstop will harvest the row instead.
  }
}

/** The connection ids this account sent a request for, past or present. */
export function readMyRequests(): Set<string> {
  return new Set(read())
}
