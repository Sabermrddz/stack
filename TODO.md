# TODO: Build my personal full-stack starter (CLI + template)

> Instructions for the AI agent (opencode): work phase by phase, in order.
> After finishing each task, tick its checkbox `[x]`. Do not skip phases.
> Never commit real secrets. Only `.env.example` goes in git.
> Ask me before adding any dependency not listed here.

## Goal

A CLI published as an npm package, so that `npx my-stack my-app` scaffolds a new Next.js project from `template/`.
Stack: Next.js (App Router) + React + TypeScript + Tailwind, Better-Auth (Google + GitHub), MongoDB (Mongoose),
Backblaze B2 (S3 API), Arcjet, Cloudflare Turnstile, Zod, env validation.

---

## Phase 1: Repo structure

- [x] Create `package.json` (name `my-stack`, `"bin": { "my-stack": "bin/cli.js" }`, `"type": "module"`, `"files": ["bin", "template"]`)
- [x] Create folders: `bin/`, `template/`
- [x] Add `.gitignore` (node_modules, .env, .env.local, .next, dist) and `.npmignore`
- [x] Add `README.md` (what it is, usage, required env keys) and `LICENSE` (MIT)

## Phase 2: Template app (`template/`)

- [x] Init Next.js (latest, App Router, TypeScript, Tailwind, ESLint, `src/` dir) inside `template/`
- [x] Add security headers in `next.config` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [x] Add `zod` and `@t3-oss/env-nextjs`; create `src/env.ts` validating every env var
- [x] Create `template/.env.example` with all keys (see list at the bottom)

## Phase 3: Database (MongoDB + Mongoose)

- [x] Install `mongoose`
- [x] Create `src/lib/db.ts` with a cached connection (safe for Next.js hot reload)
- [x] Create an example model `src/models/Example.ts`

## Phase 4: Auth (Better-Auth)

- [x] Install `better-auth` and its MongoDB adapter
- [x] Create `src/lib/auth.ts` with Google + GitHub providers (+ optional email/password)
- [x] Create `src/lib/auth-client.ts`
- [x] Add API route `src/app/api/auth/[...all]/route.ts`
- [x] Build `/login` page with "Sign in with Google" and "Sign in with GitHub" buttons
- [x] Add a protected example page `/dashboard` (redirect to `/login` if no session)

## Phase 5: Protection layers

- [x] **Arcjet**: install `@arcjet/next`; create `src/lib/arcjet.ts` (rate limit + bot detection + shield); apply on auth and API routes
- [x] **Turnstile**: create `<TurnstileWidget />` component and server helper `verifyTurnstile(token)`; use it on login and any public form
- [x] **Middleware**: implemented as `src/proxy.ts` — Next 16 deprecated `middleware.ts` (same API, export renamed to `proxy`); basic request protection, skip static assets
- [x] Write `docs/CLOUDFLARE.md` explaining the manual steps: add domain to Cloudflare (free plan), enable Managed Challenge / Under Attack Mode, enable proxy (orange cloud), create Turnstile site

## Phase 6: File uploads (Backblaze B2)

- [x] Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- [x] Create `src/lib/storage.ts` with an S3 client pointed at the B2 endpoint
- [x] Add API route that returns a presigned upload URL (auth required, validate file type and size with Zod)
- [x] Add an example upload component

## Phase 7: CLI (`bin/cli.js`)

- [x] Read the project name from `process.argv`; refuse if the folder already exists
- [x] Copy `template/` to the target folder (rename `_gitignore` to `.gitignore` after copying)
- [x] Replace the project name inside the new `package.json`
- [x] Print next steps: `cd my-app`, `npm install`, copy `.env.example` to `.env`, `npm run dev`
- [ ] (Optional, later) interactive prompts to include/exclude Arcjet, Turnstile, uploads

## Phase 8: Test locally

- [x] Run `npm link` in the repo, then `my-stack test-app` in a temp folder
- [x] In `test-app`: `npm install`, `npm run build`, `npm run dev` must all pass with no errors
- [x] Fix any problems found, then re-test

## Phase 9: Push to GitHub

- [ ] `git init` and make sure `.env` is NOT tracked (`git status` check)
- [ ] First commit: `feat: initial stack`
- [ ] Create the GitHub repo (empty, public or private, no README)
- [ ] `git branch -M main`
- [ ] `git remote add origin https://github.com/<USERNAME>/<REPO>.git`
- [ ] `git push -u origin main`
- [ ] (Optional) enable **Template repository** in GitHub Settings
- [ ] (Optional) `npm publish` after checking the package name is free

---

## Env keys (`.env.example`)

```
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

## Definition of done

- [ ] `npx my-stack my-app` creates a working project
- [ ] Login with Google and GitHub works
- [ ] Turnstile blocks form submits without a valid token
- [ ] Arcjet rate-limits repeated requests
- [ ] File upload to B2 works
- [ ] Code is pushed to GitHub with no secrets inside
