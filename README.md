# GEOrank — Deployment Guide

Optimize your merchants for Google & AI Search.

---

## URLs after deploy

| Route | What it is |
|-------|-----------|
| `yourdomain.com/` | Merchant app (login, dashboard, all tabs) |
| `yourdomain.com/admin` | Admin portal (separate login, 2FA) |

---

## Deploy to Vercel in 5 minutes

### Step 1 — Push to GitHub

```bash
cd georank
git init
git add .
git commit -m "Initial GEOrank deploy"
gh repo create georank --public --push
# or manually: git remote add origin https://github.com/YOUR_NAME/georank.git && git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to **vercel.com** → sign in with GitHub
2. Click **"Add New Project"**
3. Import your `georank` repo
4. Leave all settings as default (Vercel auto-detects Vite)
5. Click **Deploy** — done in ~30 seconds

### Step 3 — Add a custom domain (optional)

In Vercel → your project → **Settings → Domains** → add `app.georank.io` (or whatever you own)

---

## Local development

```bash
npm install
npm run dev
# → http://localhost:5173        (merchant app)
# → http://localhost:5173/admin  (admin portal)
```

---

## Admin access

Go to `/admin` and sign in:
- **Email:** admin@georank.io (or any email)
- **Password:** any 4+ characters
- **MFA:** any code

In production, replace `AdminLogin` in `src/pages/AdminApp.jsx` with a real auth check against your backend.

---

## Adding real auth & billing (next steps)

The app uses `localStorage` for sessions right now, which is fine for demos.
For production, wire up:

| Layer | Recommended tool |
|-------|-----------------|
| Auth  | [Supabase Auth](https://supabase.com) or [Clerk](https://clerk.com) |
| Database | Supabase Postgres or Firebase |
| Payments | [Stripe](https://stripe.com) — use Stripe Checkout for the billing step |
| Email | [Resend](https://resend.com) for invoices and alerts |

Replace `src/storage.js` with API calls to your backend and the app is production-ready.

---

## Project structure

```
georank/
├── src/
│   ├── pages/
│   │   ├── MerchantApp.jsx   ← full merchant dashboard
│   │   └── AdminApp.jsx      ← admin portal
│   ├── components/
│   │   └── ui.jsx            ← shared primitives (Btn, Card, etc.)
│   ├── constants.js          ← design tokens, plans, seed data
│   ├── storage.js            ← localStorage wrapper (swap for API calls)
│   ├── main.jsx              ← router (/ → merchant, /admin → admin)
│   └── index.css             ← global styles + font imports
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── vercel.json               ← SPA routing fix for Vercel
└── package.json
```
