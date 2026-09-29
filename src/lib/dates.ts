/**
 * Locale-stable date/time formatting.
 *
 * All formatting pins to a fixed locale ('en-GB') so the server-rendered HTML
 * and the first client render always produce identical text — otherwise React
 * hydration fails with a text mismatch (e.g. "Tuesday, 29 September" on the
 * server vs "Tuesday, September 29" in a browser using a US locale).
 * Call sites may pass their own locale to override the default.
 */

const APP_LOCALE = 'en-GB'

export function formatLongDate(date: Date, locale: string = APP_LOCALE) {
  return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatShortDate(date: Date, locale: string = APP_LOCALE) {
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

export function formatWeekday(date: Date, locale: string = APP_LOCALE) {
  return date.toLocaleDateString(locale, { weekday: 'long' })
}

export function formatMonthYear(date: Date, locale: string = APP_LOCALE) {
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

export function formatTime(date: Date, locale: string = APP_LOCALE) {
  return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
}

export function formatDefaultDate(date: Date, locale: string = APP_LOCALE) {
  return date.toLocaleDateString(locale)
}
