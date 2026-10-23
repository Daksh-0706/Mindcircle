# MindCircle — Native Android app

The Android app is a **native Kotlin + Jetpack Compose** client. It is **not** a
WebView wrapper: the UI, navigation, auth and chat are all native code in
[`android-app/`](../android-app).

## How it talks to your data

Your backend is unchanged and is still the source of truth:

```
┌──────────────────────┐   Authorization: Bearer <access_token>
│  Android app          │ ─────────────────────────────────────► ┌─────────────────────┐
│  Kotlin + Compose     │                                        │ Next.js API routes   │
│  supabase-kt (auth,   │ ◄───────────────────────────────────── │ /api/* (21 routes)   │
│  realtime, storage)   │              JSON                     └──────────┬────────────┘
└──────────┬───────────┘                                                    │
           │  wss: realtime chat      https storage (signed URLs)           │ supabase-js
           └──────────────────────────────► ┌───────────────────────────────▼──────┐
                                            │ Supabase (Postgres + RLS + Auth)     │
                                            └──────────────────────────────────────┘
```

Three clients, one session:

| Concern | Client |
|---|---|
| Business logic (journal, mood, connections, chat history, …) | OkHttp → `https://mindcircle.vercel.app/api/*` with the Supabase access token |
| Sign-in, session refresh, realtime chat | supabase-kt against `*.supabase.co` |
| Uploading photo messages | supabase-kt Storage → `chat-media` / `story-media` buckets |

### The one server change

`src/lib/supabase/server.ts` now also reads an `Authorization: Bearer <jwt>`
header, in addition to cookies. A native app cannot hold cookies, so without
this every route answers `401`.

Nothing is trusted on its own: the token is still forwarded to Supabase's auth
server (`auth.getUser()`) *and* to PostgREST (so **Row Level Security still
decides**), and the browser path is untouched — when no `Authorization` header
is present, the client is configured byte-for-byte as before.

Verified with `scripts/probe-bearer.mjs` and `scripts/probe-bearer2.mjs`: the
token reaches both `/auth/v1/user` and `/rest/v1/...`, so RLS sees the user.

## Building the APK

Prerequisites: JDK 17+, the Android SDK (already on your machine), and the
Gradle distribution at `%USERPROFILE%\.gradle-dist\gradle-8.14.3`.

```powershell
cd android-app
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
& "$env:USERPROFILE\.gradle-dist\gradle-8.14.3\bin\gradle.bat" wrapper --gradle-version 8.14.3
.\gradlew.bat assembleRelease
```

Outputs land in `android-app/app/build/outputs/apk/release/`.

- Debug build (signed with the Android debug key, installable for testing):
  `.\gradlew.bat assembleDebug` → `app-debug.apk`.
- Release build (signed with your keystore): `.\gradlew.bat assembleRelease`
  → `app-release.apk`.

## Configuration

Everything is read from `android-app/local.properties` (gitignored) so nothing
secret is committed:

```properties
sdk.dir=C\:\\Users\\daksh\\AppData\\Local\\Android\\Sdk
mindcircle.supabaseUrl=https://<project-ref>.supabase.co
mindcircle.supabaseAnonKey=<anon / publishable key>
mindcircle.googleServerClientId=<OAuth client ID of type *Android*>
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are public values — they ship inside the
website's JS bundle — and every request they make is still gated by RLS.

## Google sign-in (the one manual step)

Native sign-in uses **Credential Manager**, which returns a Google ID token that
is handed to Supabase.

**You need two OAuth client IDs, not one.** This is a Google design quirk, and
the Supabase docs call it out explicitly ("Use the Web Client ID, not the
Android one!"):

- The **Web** client ID is the one that goes *in the app* (`setServerClientId`).
- The **Android** client ID is what proves to Google that *this app* is asking;
  it is registered against your package name + signing SHA-1 and added to
  Supabase's authorized list.

You already have the release SHA-1 (`9A:BE:55:FA:46:34:A1:97:32:C5:0A:C8:50:75:59:81:B9:2F:31:BB`)
from the keystore generated earlier.

### 1. Google Cloud Console → APIs & Services → OAuth consent screen

If you have not already: **External** user type, app name, your email, and add
`https://mindcircle.vercel.app` and `https://<project-ref>.supabase.co` as
authorised domains. While the app is in *Testing* mode, add your Google account
as a **test user** — otherwise sign-in fails with `access_blocked` for anyone
else.

### 2. Create the **Web** client ID

**Credentials → Create credentials → OAuth client ID → Web application**

- *Name*: `mindcircle-web`
- *Authorised JavaScript origins*:
  - `https://mindcircle.vercel.app`
  - `https://<project-ref>.supabase.co`
- *Authorised redirect URIs* (this one is required by Supabase):
  - `https://<project-ref>.supabase.co/auth/v1/callback`

Copy this client ID into `mindcircle.googleServerClientId` in
`local.properties`. **This is the Web ID, not the Android one.**

### 3. Create the **Android** client ID

**Credentials → Create credentials → OAuth client ID → Android**

- *Name*: `mindcircle-android`
- *Package name*: `app.mindcircle.android`
- *SHA-1*: `9A:BE:55:FA:46:34:A1:97:32:C5:0A:C8:50:75:59:81:B9:2F:31:BB`

Keep this client ID too — Supabase needs it in the next step. (Debug builds are
signed with a different SHA-1 and would need their own Android client ID.)

### 4. Supabase → Authentication → Providers → Google

- *Client ID (for web)*: the **Web** client ID from step 2
- *Client Secret*: from the Web client ID row in Google Cloud
- *Authorized Client IDs*: `web-client-id,android-client-id` — **Web ID first**,
  comma-separated, no spaces. This is what makes Supabase accept the native
  token.
- Enable **nonce check** if you see the option.

Until steps 2–4 are done, the sign-in button shows a "not configured" message —
every other screen works once you are signed in through any other means.

## Screen map

| Screen | Route in app | Calls |
|---|---|---|
| Sign in | — | Credential Manager → `auth.signInWithIdToken` → `POST /api/profile/ensure` |
| Home | `home` | `GET /api/me`, `GET /api/mood`, `GET /api/activities`… |
| Journal | `journal` | `GET/POST/DELETE /api/journal` |
| Insights | `insights` | `GET /api/mood` |
| Chats | `chats` | `GET /api/chat`, `GET /api/chat/dm`, realtime |
| Discover | `discover` | `GET /api/profiles`, `POST /api/connections` |
| Crisis | `crisis` | none — works signed out, same as the web |
| Settings | `settings` | `GET/PATCH /api/me` |

## What is deliberately different from the web

- **No dark theme.** Your web app is light-only (the Dark Mode toggle is
  explicitly "Visual only"), so the app is too.
- **Feedback is inline**, matching the web: there is no toast system.
- **Insights charts** are drawn with Compose `Canvas` instead of SVG.
- Emoji are rendered from your bundled `public/emojis/*.webp` art, not the
  platform font, so moods look identical to the website on every device.
