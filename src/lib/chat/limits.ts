/**
 * How many images one chat message may carry.
 *
 * This lives apart from the validation in `src/lib/chat/media.ts` on purpose:
 * that module imports `@/lib/security`, which reaches `@/lib/supabase/server`
 * and therefore `next/headers`. Importing it from a client component drags
 * server-only code into the browser bundle and the build fails. The picker only
 * needs the number; the server still enforces it.
 *
 * Keep it in sync with the check constraint added in migration 009.
 */
export const MAX_IMAGES_PER_MESSAGE = 9
