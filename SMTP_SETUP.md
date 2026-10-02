# Resend SMTP Setup — MindCircle

Confirmation emails fail ho rahe hain. Supabase logs ka exact reason:

```
535 "Authentication credentials invalid"
```

Ye SMTP **authentication** failure hai (rate limit nahi) — Supabase ka built-in
mail server credentials reject kar raha hai. Fix: custom SMTP provider set karna.

Ye doc dono dev (`localhost:3000`) aur production ke liye hai.

---

## 1. Resend par account banao

- https://resend.com → sign up
- Resend free tier: **3,000 emails/month**, 100/day. Dev ke liye kaafi hai.

## 2. Domain verify karo (production ke liye zaroori)

Resend → **Domains** → **Add Domain**

- `localhost` ke liye skip kar sakte ho (steps 6 mein explain hai)
- Production ke liye apna domain add karo, e.g. `mindcircle.app`
- DNS records add karo (SPF + DKIM) — Resemailguide dikha dega
- Verify hone tak wait karo (usually 5–30 min)

## 3. API key banao

Resend → **API Keys** → **Create API Key**

- Name: `MindCircle Supabase SMTP`
- Permission: **Sending access**
- Key copy karke rakho (`re_...` se start hoti hai) — **sirf ek baar dikhti hai**

## 4. Resend ke SMTP credentials

Ye teen values chahiye (Resend → **SMTP & API**):

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` (TLS) ya `587` (STARTTLS) |
| Username | `resend` |
| Password | Resend API key (`re_...`) |

> Username hamesha `resend` hota hai — apni email nahi.

## 5. Supabase mein set karo

Supabase Dashboard → project `btamknquiykxyjmutoki`
→ **Project Settings** → **Email**

| Supabase field | Value |
|---|---|
| Enable email provider | **ON** |
| SMTP host | `smtp.resend.com` |
| SMTP port | `465` |
| SMTP user | `resend` |
| SMTP password | `re_...` (Resend API key) |

**Save** dabao. Koi email bhejne ki zaroorat nahi.

> ⚠️ Zaroori: **"Enable email confirmations" ON** rehne do. Yahi setting hai
> jo tumne abhi on ki thi — woh sahi hai, bas SMTP missing tha.

## 6. Redirect URLs

Supabase Dashboard → **Authentication** → **URL Configuration**

**Site URL**: `http://localhost:3000` (dev) ya production domain

**Redirect URLs** mein ye dono add karo:

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
```

Production ke liye `https://<domain>/auth/callback` aur
`https://<domain>/auth/confirm` bhi add kar do.

> `/auth/callback` → Google OAuth ke liye
> `/auth/confirm` → confirmation email link ke liye

---

## Verify karo

Ye command chalao — email deliver hone lagi ya nahi pata chal jayega:

```bash
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "content-type: application/json" \
  -d '{"email":"<tumhara-email>","password":"TestPass123!"}'
```

Pehle `535 Authentication credentials invalid` aata tha. Sahi hone par:

```json
{ "id": "...", "email": "...", "confirmation_sent_at": "..." }
```

aur log mein `status: 200` with koi error nahi.

## ⚠️ Domain verify ke bina sirf apni email pe chalta hai

Ye zaroori step hai, ise skip mat karna. Domain verify **nahi** kiya to Resend
sirf in recipients ko bhejta hai:

- `dakshkumar0207@gmail.com` (Resend account ka apna address)
- `delivered@resend.dev` (Resend ka official test inbox)

Kisi **doosre** email pe signup karne pe ye error aata hai:

```
550 "You can only send testing emails to your own email address
     (dakshkumar0207@gmail.com). To send emails to other recipients,
     please verify a domain at resend.com/domains"
```

Matlab SMTP theek hai, lekin real users signup nahi kar payenge jab tak
domain verify nahi hota. Domain verify karne ke baad step 2 wapas padho:
Resend → Domains → apna domain add karo → DNS records → Verify.

Verify hone ke baad koi bhi email pe signup kaam karega.

---

## Common problems

| Problem | Fix |
|---|---|
| `535 Authentication credentials invalid` | API key galat ya username `resend` nahi hai |
| `550` / `553` | Domain verify nahi hua — DNS records wait karo |
| Email nahi, error nahi | Spam folder check karo; Resend → **Logs** mein delivery status dekho |
| Confirmation link 404 | `/auth/confirm` redirect URL list mein add nahi hai |

---

## Code side already ready hai

Ye sab pehle se implement hai, SMTP set karte hi kaam karega:

- `src/app/auth/confirm/route.ts` — confirmation link → session exchange
- Signup `emailRedirectTo` → `/auth/confirm`
- OTP resend → same redirect
- `src/lib/auth-errors.ts` — delivery failures ab readable message dete hain

Email deliver hone ke baad bhi issue aaye to mujhe batao — main verify kar lunga.