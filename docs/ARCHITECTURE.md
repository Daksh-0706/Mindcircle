# MindCircle — Solution Architecture & Workflows

> All diagrams are [Mermaid](https://mermaid.js.org). They render natively on GitHub and in most Markdown viewers.

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph CLIENT["🖥️ Client — Browser"]
        UI["Next.js App Router UI<br/>(React 19 · TypeScript · Tailwind v4 · shadcn/base-nova · framer-motion)"]
    end

    subgraph NEXT["⚙️ Next.js 16 Server (Node.js)"]
        PROXY["src/proxy.ts — Session Guard<br/>(updateSession on every request)"]
        subgraph RSC["Server Components"]
            SC["Server-rendered pages<br/>(createClient via cookies)"]
        end
        subgraph API["Route Handlers — /api/*"]
            ME["/api/me"]
            MOOD["/api/mood"]
            JRNL["/api/journal"]
            MATCH["/api/matches"]
            STRY["/api/stories + /like"]
            CHAT["/api/chat (rooms)"]
            CHATMSG["/api/chat/messages"]
            DM["/api/chat/dm"]
        end
    end

    subgraph SUPA["🗄️ Supabase"]
        AUTH["Auth<br/>(email + OTP)"]
        PG[("PostgreSQL<br/>+ Row Level Security")]
        RT["Realtime<br/>(postgres_changes)"]
    end

    UI -->|"HTTP request"| PROXY
    PROXY -->|"session refreshed<br/>+ route guard"| RSC
    PROXY --> API
    SC -->|"SSR data fetch"| PG
    API -->|"PostgREST queries<br/>(anon key + user JWT)"| PG
    AUTH -.->|"session cookie<br/>sb-* tokens"| PROXY
    RT -.->|"INSERT events<br/>(new messages)"| UI
```

### Layers

| Layer | Technology | Responsibility |
|---|---|---|
| Presentation | Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui (base-nova), framer-motion, lucide | Mobile-first UI: dashboard, journal, chats, connect, insights, activities, counsellors, crisis |
| Routing / Guard | `src/proxy.ts` (Next 16 middleware → proxy) | Session refresh via `@supabase/ssr` + redirect logic (guest → `/login`, signed-in → `/app`) |
| API | Route Handlers in `src/app/api/*` | Thin, auth-checked JSON endpoints wrapping Supabase queries |
| Data | Supabase (PostgreSQL + PostgREST) | `users`, `mood_logs`, `journal_entries`, `stories`, `story_likes`, `chat_rooms`, `room_members`, `messages`, `direct_messages`, `matches` |
| Security | RLS policies + Postgres trigger | Owner-only rows; membership-gated chat reads; auto-profile on signup |
| Realtime | Supabase Realtime | Live message INSERTs in the chat page |

---

## 2. Request Lifecycle — Auth Guard (proxy)

```mermaid
flowchart TD
    A["Request → /app/... or auth pages"] --> P["proxy.ts<br/>updateSession()"]
    P --> C["createServerClient<br/>reads sb-* cookies"]
    C --> G["supabase.auth.getUser()"]
    G -->|"valid session<br/>(refreshed tokens set on response)"| D{Route check}
    G -->|"no / invalid session"| N{Route check}

    D -->|"/app/*"| OK["✅ Continue (RSC / API)"]
    N -->|"/app/*"| R1["🔀 Redirect → /login"]
    D -->|"/ • /login • /signup • /landing"| R2["🔀 Redirect → /app<br/>(already signed in)"]
    N -->|"/ • /login • /signup • /landing"| OK2["✅ Continue"]
    D -->|"other"| OK3["✅ Continue"]
    N -->|"other"| OK3
```

Key file: `src/lib/supabase/middleware.ts` — one guard runs for **both** pages and API routes; cookies are refreshed request-scoped.

---

## 3. Authentication & Signup Workflow

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as Client (React)
    participant SB as Supabase Auth
    participant PG as Postgres (trigger)
    participant PX as proxy.ts

    U->>FE: Signup (email + password)
    FE->>SB: signUp()
    SB-->>FE: user + session
    SB->>PG: INSERT auth.users (after insert trigger)
    PG->>PG: handle_new_user() [SECURITY DEFINER]
    PG->>PG: INSERT public.users<br/>(id, email, anonymous_id="anon-xxxx", avatar_emoji)
    Note over PG: Profile row auto-created,<br/>FK cascade on account deletion
    FE->>FE: verify-otp (if email confirmation) → onboarding
    U->>PX: GET /app
    PX->>SB: getUser() → valid → allow
    U->>FE: Dashboard
```

**Login path** mirrors it: `signInWithPassword` → session cookie → proxy allows `/app/*`. OTP verification lives in `(auth)/verify-otp`.

---

## 4. Data-Access Workflows (Client → API → Supabase)

All feature writes go through **Route Handlers** (never direct client writes) so every call re-checks `supabase.auth.getUser()` before touching the DB — RLS is the second wall.

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant UI as Client Page
    participant API as Route Handler
    participant DB as Supabase (PostgREST + RLS)

    U->>UI: action (log mood / save journal / post story…)
    UI->>API: fetch('/api/<feature>', {method, body})
    API->>API: createClient() ← cookies
    API->>DB: auth.getUser()
    DB-->>API: user (or 401 → stop)
    API->>DB: .from(table).insert/select/delete
    DB->>DB: RLS: auth.uid() = user_id
    DB-->>API: rows / error
    API-->>UI: JSON {data} | {error, status}
    UI-->>U: optimistic UI update
```

### Endpoint → Table Map

| Route | Methods | Table(s) | Notes |
|---|---|---|---|
| `/api/me` | GET, PATCH | `users` | Profile + settings blob (jsonb) |
| `/api/mood` | GET, POST | `mood_logs` | Owner-only (RLS) |
| `/api/journal` | GET, POST, DELETE | `journal_entries` | Owner-only; delete scoped `user_id` |
| `/api/matches` | GET, POST | `matches` | Peer-match rows, scored ordering |
| `/api/stories` | GET, POST, DELETE | `stories` | 24h feed: `expires_at` filter, like counts joined in |
| `/api/stories/like` | POST | `story_likes` | Toggle like + re-count |
| `/api/chat` | GET, POST, DELETE | `chat_rooms`, `room_members` | Rooms list w/ member count, join/leave |
| `/api/chat/messages` | GET, POST | `room_members`, `messages` | **Auto-join room** then read (RLS requires membership) |
| `/api/chat/dm` | GET, POST | `direct_messages`, `users` | Thread grouping, unread counts, dead-peer checks |

---

## 5. Realtime Chat Workflow (rooms + DMs)

```mermaid
sequenceDiagram
    autonumber
    actor A as User A
    participant FE as Chat Page (client)
    participant API as /api/chat/dm · /messages
    participant DB as Supabase Postgres
    participant RT as Supabase Realtime
    actor B as User B

    A->>FE: open chat /app/chat/[id]
    FE->>API: GET history (room auto-join if room)
    API->>DB: select messages / direct_messages
    DB-->>FE: history rows
    FE->>RT: subscribe channel "chat-{peerId}"<br/>postgres_changes INSERT on messages | direct_messages
    A->>API: POST send (optimistic bubble w/ temp id)
    API->>DB: INSERT (sender_id = auth.uid())
    DB-->>RT: NOTIFY → broadcast INSERT event
    RT-->>A: new row → replace temp bubble
    RT-->>B: new row → append instantly (no refresh)
```

---

## 6. Data Model (Supabase Postgres)

```mermaid
erDiagram
    auth_users ||--o| users : "trigger: handle_new_user"

    users ||--o{ mood_logs : "user_id"
    users ||--o{ journal_entries : "user_id"
    users ||--o{ stories : "user_id"
    users ||--o{ story_likes : "user_id"
    stories ||--o{ story_likes : "story_id"
    users ||--o{ room_members : "user_id"
    chat_rooms ||--o{ room_members : "room_id"
    chat_rooms ||--o{ messages : "room_id"
    users ||--o{ messages : "sender_id"
    users ||--o{ direct_messages : "sender_id / receiver_id"
    users }o--o{ matches : "user1_id / user2_id"

    users {
        uuid id PK "FK → auth.users, cascade delete"
        text email
        text anonymous_id "anon-xxxxxxxx"
        text avatar_emoji
        jsonb settings
    }
    mood_logs {
        uuid id PK
        uuid user_id FK
        int mood_score
        text mood_emoji
        text note
    }
    journal_entries {
        uuid id PK
        uuid user_id FK
        text content
        text_array media_urls
        text mood_tag
        bool is_anonymous
        bool is_private
    }
    stories {
        uuid id PK
        uuid user_id FK
        text content
        text media_url
        text mood_emoji
        timestamptz expires_at
        bool is_active
    }
    story_likes {
        uuid id PK
        uuid story_id FK
        uuid user_id FK
    }
    chat_rooms {
        uuid id PK
        text name
        bool is_active
    }
    room_members {
        uuid id PK
        uuid room_id FK
        uuid user_id FK
    }
    messages {
        uuid id PK
        uuid room_id FK
        uuid sender_id FK
        text content
        text message_type
        bool is_anonymous
        bool is_deleted
    }
    direct_messages {
        uuid id PK
        uuid sender_id FK
        uuid receiver_id FK
        text content
        bool is_read
    }
    matches {
        uuid id PK
        uuid user1_id FK
        uuid user2_id FK
        float similarity_score
        text match_reason
    }
```

### Security Model (RLS summary)

| Table | Policy essence |
|---|---|
| `mood_logs`, `journal_entries` | Owner-only CRUD (`auth.uid() = user_id`) |
| `stories` | Public read (authenticated), owner insert/delete |
| `story_likes` | Public read, owner insert/delete, `unique(story_id, user_id)` |
| `chat_rooms` | Authenticated read |
| `room_members` | Own memberships only |
| `messages` | **Membership-gated**: select/insert requires a `room_members` row |
| `direct_messages` | Participant-only (sender/receiver = auth.uid) |
| `users` | No INSERT policy — populated by `SECURITY DEFINER` trigger on signup |

---

## 7. Page / Route Structure

```mermaid
flowchart LR
    ROOT["/ → redirect /landing"] --> AUTH

    subgraph AUTH["(auth) route group — guest only"]
        L["/landing"] --> S["/signup"] --> V["/verify-otp"] --> O["/onboarding"] --> APP
        L --> LI["/login"] --> APP
    end

    subgraph APP["/app — auth required (layout: AppLayout)"]
        D["/app Dashboard<br/>mood check-in, stats"]
        J["/app/journal"]
        C["/app/connect<br/>people + rooms"]
        CH["/app/chats → /app/chat/[id]<br/>rooms & DMs, realtime"]
        I["/app/insights<br/>mood charts"]
        AC["/app/activities[/id]<br/>guided exercises"]
        CO["/app/counsellors[/id]<br/>static directory"]
        CR["/app/crisis<br/>helplines"]
        ST["/app/story/create"]
        PR["/app/profile"]
        SE["/app/settings"]
        H["/app/help/*"]
    end

    APP --> API["/api/* route handlers"]
```

Navigation adapts to device: `BottomNav` (mobile), `SideNav` (desktop), via `useMediaQuery`.

---

## 8. Deployment & Runtime Topology

```mermaid
flowchart LR
    U["👤 User browser"] -->|"HTTPS"| H["Next.js host<br/>(Vercel or Node server)"]
    H -->|"SSR / RSC render"| U
    H -->|"Route Handlers"| S["Supabase cloud<br/>Postgres + Auth + Realtime"]
    U -->|"browser client<br/>(anon key + cookie session)"| S
    U -->|"wss (realtime)"| S
    ENV[".env.local<br/>NEXT_PUBLIC_SUPABASE_URL<br/>NEXT_PUBLIC_SUPABASE_ANON_KEY"] --> H
```

- Everything user-facing uses the **anon key + RLS** — no service-role key in the web app.
- Migrations live in [`supabase/migrations/`](../supabase/migrations) and run manually in the Supabase SQL Editor in numeric order; each one is idempotent. One-off data repairs are kept separately in [`supabase/maintenance/`](../supabase/maintenance) because they are not part of the schema. See [`docs/DATABASE.md`](DATABASE.md) for the table reference.
- Counsellor directory is **static** (`src/lib/counsellors.ts`) — no DB table yet.
