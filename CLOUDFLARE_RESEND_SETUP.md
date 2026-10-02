# Cloudflare + Resend — har user tak OTP email

## Problem kya hai (abhi ka exact state)

SMTP **theek chal raha hai**, lekin Resend sirf do recipients tak bhej raha hai:

- `dakshkumar0207@gmail.com` (Resend account ki apni email)
- `delivered@resend.dev` (Resend ka test inbox)

Kisi doosre email pe signup:

```
550 "You can only send testing emails to your own email address...
      please verify a domain at resend.com/domains"
```

Ye Resend ka sandbox rule hai. Domain verify hone ke **bina** koi workaround
nahi hai — koi bhi provider (SendGrid, Mailgun, Postmark) ye same rule lagata
hai. Sirf verified domain se arbitrary recipients ko mail jaata hai.

Aur verify karne ke liye DNS records add karne ka control chahiye — jo tab
milega jab tumhare paas apna domain ho.

---

## Solution: Cloudflare

Cloudflare se **dono** problems solve hoti hain:

| Problem | Cloudflare se |
|---|---|
| Domain nahi hai | Cloudflare Registrar domain **cost pe** bechta hai (no markup) |
| DNS control nahi | Cloudflare DNS — Resend ke records add kar sakte ho |
| Hosting | Next.js 16 Workers pe deploy ho sakta hai (free tier) |

### Bonus: Resend ka Cloudflare one-click integration

Resend mein **"Sign in to Cloudflare"** button hai jo Domain Connect use karke
DNS records automatically configure kar deta hai. Manually SPF/DKIM copy-paste
karne ki zaroorat nahi padegi.

---

## Step 1 — Domain kharido (Cloudflare Registrar)

- https://dash.cloudflare.com → **Register Domains**
- Cloudflare wholesale cost pe bechta hai (naki markup)
- `.com` ~$10/yr, `.app` ~$15/yr
- Checkout ke baad domain **automatically** Cloudflare nameservers par set ho
  jaata hai — koi separate DNS config nahi karna

> Purchase ke baad 24–48h lag sakte hain activation mein.

## Step 2 — Resend mein domain verify karo

1. Resend → **Domains** → **Add Domain**
2. Apna domain daalo (e.g. `mindcircle.app`)
3. Cloudflare pe hosted hai to **"Sign in to Cloudflare"** button dikhega —
   use karo, records apne aap set ho jayenge
4. Verify status **Verified** ho jaana chahiye (5–30 min)

> Agar manually karna ho: Resend jo DKIM (TXT/CNAME) aur MX records dikhata
> hai, wahi exactly Cloudflare DNS mein add karo. Cloudflare kabhi kabhi
> `_domainkey` ke NS records conflict karta hai — verify na ho to unhe delete
> karke dobara try karo.

## Step 3 — Supabase ka "from" address badlo

Ye step bhoolna sabse common mistake hai. Domain verify hone ke baad bhi agar
Supabase apna default `auth@<project-ref>.supabase.co` se bhejta raha to
Resend reject kar dega.

Supabase Dashboard → **Project Settings** → **Email**:

- **SMTP From Address** → `auth@<tumhara-domain>` (verified domain ka)
- SMTP fields wahi rehne do:
  - Host `smtp.resend.com`
  - Port `465`
  - User `resend`
  - Password Resend API key

Save karo.

## Step 4 — Email template check

Supabase → **Authentication** → **Email Templates** → **Confirm signup**

Default template theek hai. Sirf tab badalna hai agar tumhe **6-digit OTP code**
chahiye link ke bajaye (app ka `/verify-otp` page 6-digit code expect karta hai):

```html
<h2>Confirm your email</h2>
<p>Enter this code to finish signing up:</p>
<p style="font-size:28px"><strong>{{ .Token }}</strong></p>
<p>Or <a href="{{ .ConfirmationURL }}">confirm your email</a></p>
```

> Token placeholder `{{ .Token }}` hai — `{{ .TokenHash }}` nahi. TokenHash
> link-based flow ke liye hai, jo `/auth/confirm` route handle karta hai.

## Step 5 — Supabase redirect URLs

Supabase → **Authentication** → **URL Configuration**

```
https://<tumhara-domain>/auth/callback     ← Google OAuth
https://<tumhara-domain>/auth/confirm     ← confirmation link
```

Dev ke liye `http://localhost:3000/...` wale bhi rakho.

---

## Verify karo

Kisi bhi naye email se signup karke dekho:

```bash
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "content-type: application/json" \
  -d '{"email":"koi-bahar-ka-email@gmail.com","password":"TestPass123!"}'
```

Domain verify hone se pehle: `550 ... verify a domain`
Domain verify hone ke baad: `200` + `"confirmation_sent_at": "..."`

---

## Optional: Next.js 16 ko Cloudflare pe host karo

Ye domain fix ke liye zaroori **nahi** hai, but free hosting + global edge deta hai.

Cloudflare do raaste deta hai:

1. **OpenNext** (`@opennextjs/cloudflare`) — community adapter, Next.js 16 ke
   saare minor/patch versions supported hain
2. **vinext** — Cloudflare ka naya default recommendation (Aug 2026 se)

### Ek zaroori baat: asset size

Tumhare `public/` folder mein **93 files, total ~30 MB** hain, sabse bade ~1.8 MB
ke PNGs. Ye Cloudflare Workers pe deploy karte waqt matter karega:

- Workers static assets ka bundle limit hai
- `chats-sheet.png`, `connect-sheet.png`, `activities-girl.png`,
  `counsellor-card-*.png`, `insights-sheet.png` — ye ~1.7–1.8 MB each hain

Deploy se pehle inhe compress karna behtar rahega (WebP conversion se aam taur
par 70–85% bachega). Bade static assets R2 bucket mein rakhna bhi ek option hai,
taaki worker bundle chhota rahe.

### Achhi khbaar

Project plain `<img>` use karta hai, `next/image` nahi — iska matlab Cloudflare
ka Image Optimization setup karne ki zaroorat nahi. Ye deploy ke liye
simplifying hai.

---

## Code side already ready hai

Ye sab pehle se implement hai, domain verify karte hi kaam karega:

- `src/app/auth/confirm/route.ts` — confirmation link → session exchange
- Signup + OTP resend → `emailRedirectTo` points at `/auth/confirm`
- `src/lib/auth-errors.ts` — delivery failures readable message dete hain
- `src/app/api/profile/ensure` — profile row provisioning

Domain verify ho jaye to batao, main live verify karta hoon ki real email pe
signup chal rahi hai ya nahi.