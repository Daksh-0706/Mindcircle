# Vercel Deployment Guide — MindCircle

Hosting: **Vercel** · Domain: **Cloudflare Registrar** · Backend: **Supabase** · Email: **Resend**

---

## Pehle ye kar lo (email fix — dependency hai)

Bina iske production pe signup fail hoga. Details [CLOUDFLARE_RESEND_SETUP.md](CLOUDFLARE_RESEND_SETUP.md) mein:

1. Cloudflare Registrar se domain kharido
2. Resend mein domain verify karo (Cloudflare sign-in button)
3. Supabase → Project Settings → Email → **SMTP From Address** = `auth@<tumhara-domain>`

---

## Deploy to Vercel

### 1. Import repo

- [vercel.com/new](https://vercel.com/new)
- GitHub se select karo: **`Daksh-0706/Mindcircle`**
- Framework **Next.js** auto-detect ho jayega — kuch change karne ki zaroorat nahi

### 2. Environment variables (sabhi 3 zaroori)

Vercel → Project → **Settings** → **Environment Variables**

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://btamknquiykxyjmutoki.supabase.co` | Same as `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` se copy karo | Anon key safe hai client me |
| `NEXT_PUBLIC_APP_URL` | `https://<tumhara-domain>` | ⚠️ production URL |

**Production ke liye `Preview` checkbox bhi tick kar do** — warna preview
deployments broken rahengi.

> ⚠️ `NEXT_PUBLIC_*` variables **build time pe inline** ho jaate hain. Ye
> add karne ke baad **dobara deploy** karna padega (Deployments → ⋯ → Redeploy),
> warna existing build me nahi jayenge.

### 3. Deploy

"Deploy" dabao. Build ~2-3 min.

---

## Supabase me production URLs add karo

Supabase → **Authentication** → **URL Configuration**

**Site URL**: `https://<tumhara-domain>`

**Redirect URLs**:

```
https://<tumhara-domain>/auth/callback
https://<tumhara-domain>/auth/confirm
```

> ⚠️ **Typos se bachein.** Bade projects me galti se aisi URL add ho jaati hai
> jo kisi aur account ki ho jaati hai. Domain copy-paste karo, haath se type mat karo.

Localhost wali entries **rehne do** — parallel dev testing ke liye kaam aayengi.

---

## Domain connect karo (Cloudflare → Vercel)

1. Vercel → Project → **Settings** → **Domains**
2. Apna domain add karo (e.g. `mindcircle.app`)
3. Vercel ek CNAME record dikhaega — usually:
   ```
   @     →  cname.vercel-dns.com
   www   →  cname.vercel-dns.com
   ```
4. Cloudflare → **DNS** → **Records** → ye add karo:
   - Type `CNAME`, Name `@`, Target `cname.vercel-dns.com`, Proxy **DNS only**
     (grey cloud — proxied karne se Vercel ki SSL kaam nahi karega)
   - Type `CNAME`, Name `www`, same target
5. Vercel mein wapas jao — SSL auto-issue ho jayega (1–2 min)

> Cloudflare Registrar wale domains par SSL bhi Cloudflare manage kar sakta hai,
> par Vercel ka apna automatic SSL simple hai — proxy off rakho.

---

## Deploy ke baad verify karo

Ye sab ek-ek karke check karo:

| # | Check | Expected |
|---|---|---|
| 1 | `https://<domain>` kholo | Landing page |
| 2 | `/app/journal` kholo bina login ke | `/login` pe bounce |
| 3 | Google sign-in | Google → `/app` |
| 4 | Email signup (naya email) | Confirmation email inbox me |
| 5 | Confirmation link click | `/onboarding` |
| 6 | `/auth/callback` reload | `/app` (PKCE error nahi aana chahiye) |
| 7 | Logout → `/app/journal` | `/login?next=%2Fapp%2Fjournal` |
| 8 | Security headers | CSP + X-Frame-Options present |

---

## Gotchas

**Hydration mismatch**
Supabase client `client.ts` mein module-level hai — koi SSR/client difference
nahi hona chahiye. Error aaye to browser console dekho.

**Middleware/proxy**
`src/proxy.ts` (Next 16 ka renamed middleware) Vercel pe natively chalta hai —
koi extra config nahi.

**Images**
Project plain `<img>` use karta hai `next/image` ke bajaye, isliye Vercel ke
image optimizer config karne ki zaroorat nahi. Ye jaan-boojh kar rakha gaya hai.

**Static assets ~30 MB**
`public/` mein 93 files hain. Hobby tier pe 100 GB/month bandwidth hai, par
first load slow ho sakta hai. WebP conversion se 70–85% bachta hai — zaroorat
pade to compress kar lena.

**Bot protection / preview deploys**
Vercel Hobby plan password protection deta hai preview deployments pe. Apne
domain pe ye apply nahi hota.

---

## Rollback

Vercel → Deployments → purane deployment pe ⋯ → **Promote to Production**.
Likha hua hai kyunki git push se wapas aana mushkil hota hai.

---

## Kyun Vercel, Cloudflare Workers nahi?

Cloudflare Workers ka compressed worker limit **3 MB** (free) / **10 MB** (paid)
hai. Tumhare `public/` mein **~30 MB** static assets hain — ye dono limits se
zyada hai. Deploy se pehle compress karna padta, phir bhi paid plan chahiye.

Ye extra kaam bina fayde ke hai kyunki Workers ka faayda (Workers AI, R2,
edge compute) is app mein chahiye hi nahi.

**Render** isliye nahi — uska free tier 15 minute idle ke baad web service ko
sleep kar deta hai. Tumhare app ka har page load `getUser()` se session
revalidate karta hai, to user ko har baar cold start wait karna padega — login
screen pe hi. Auth-heavy app ke liye galat choice.

---

## Related docs

- [CLOUDFLARE_RESEND_SETUP.md](CLOUDFLARE_RESEND_SETUP.md) — email/domain
- [SMTP_SETUP.md](SMTP_SETUP.md) — SMTP fields aur troubleshooting