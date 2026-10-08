# my-stack

A CLI that scaffolds my personal full-stack starter: a Next.js (App Router) project
with TypeScript, Tailwind, auth, database, uploads, and abuse protection built in.

## Usage

```bash
npx my-stack my-app
cd my-app
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

## What's inside the template

- **Next.js** (App Router) + React + TypeScript + Tailwind CSS + ESLint
- **Better-Auth** — sign in with Google and GitHub (optional email/password), session on `/dashboard`
- **MongoDB** via Mongoose, with a hot-reload-safe cached connection
- **Backblaze B2** uploads through presigned S3 URLs
- **Arcjet** — rate limiting, bot detection, and shield on auth/API routes
- **Cloudflare Turnstile** — CAPTCHA alternative on public forms
- **Zod** env validation via `@t3-oss/env-nextjs`

## Required environment keys

Copy `.env.example` to `.env` and fill in every value:

```bash
# Database
MONGODB_URI=

# Better-Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Arcjet
ARCJET_KEY=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Backblaze B2 (S3 compatible)
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET=
B2_ENDPOINT=
B2_REGION=
```

### Manual setup required

Some keys can only be created by hand — see:

- `docs/CLOUDFLARE.md` — domain, proxy, and Turnstile site setup
- OAuth apps: create GitHub and Google OAuth clients and paste their IDs/secrets into `.env`

## License

MIT
