# my-app

Full-stack starter built with **Next.js 16 (App Router)**, TypeScript, Tailwind CSS,
Better-Auth (Google / GitHub / email+password), MongoDB + Mongoose, Backblaze B2
uploads, Arcjet protection and Cloudflare Turnstile.

## Getting started

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
# fill in every value in .env (see below)
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

All keys are validated at startup by `src/env.ts` (Zod) — the app refuses to run
with missing or empty values. Copy `.env.example` and fill in:

| Key | Where to get it |
| --- | --- |
| `MONGODB_URI` | `docs/API-KEYS.md` (MongoDB Atlas) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `http://localhost:3000` in dev |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | `docs/OAUTH.md` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | `docs/OAUTH.md` |
| `ARCJET_KEY` | `docs/API-KEYS.md` (Arcjet) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | `docs/CLOUDFLARE.md` |
| `B2_KEY_ID` / `B2_APPLICATION_KEY` / `B2_BUCKET` / `B2_ENDPOINT` / `B2_REGION` | `docs/BACKBLAZE.md` |

Never commit `.env` — only `.env.example` goes in git.

## Manual setup

Step-by-step guides live in `docs/`:

- `docs/OAUTH.md` — create the GitHub and Google OAuth apps
- `docs/CLOUDFLARE.md` — domain, proxy, security level, Turnstile site
- `docs/API-KEYS.md` — MongoDB Atlas and Arcjet keys
- `docs/BACKBLAZE.md` — B2 bucket, keys, endpoint and CORS rule

## Routes and structure

| Path | Purpose |
| --- | --- |
| `/login` | Sign in (Google, GitHub, or email + password with Turnstile) |
| `/dashboard` | Protected example page (session checked server-side) |
| `/api/auth/[...all]` | Better-Auth endpoints (behind Arcjet) |
| `/api/upload` | Presigned B2 upload URL (auth required, Zod-validated) |

```
src/
  app/            # App Router pages, layouts and route handlers
  components/     # Shared client components (Turnstile, upload)
  lib/            # auth, db, arcjet, storage, turnstile helpers
  models/         # Mongoose models
  env.ts          # Zod env validation (single source of truth)
  proxy.ts        # Request protection (Next 16's middleware)
```

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```
