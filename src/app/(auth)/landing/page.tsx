import { permanentRedirect } from 'next/navigation'

/**
 * `/landing` used to be the landing page. The canonical URL is now the site
 * root, so this only exists as a permanent redirect — anything that still
 * links here (old bookmarks, shared links, search results) lands on `/`
 * without a second URL competing for the same content in search results.
 */
export default function LandingRedirect() {
  permanentRedirect('/')
}
