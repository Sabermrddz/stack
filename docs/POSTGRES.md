# PostgreSQL (Neon) + Drizzle setup (manual)

This guide covers the **postgres** stack: Neon serverless PostgreSQL + Drizzle ORM.
No secrets belong in git — put values in `.env`.

## 1. Create a Neon account and project

1. Go to <https://neon.tech> → **Sign up** (free, no credit card required).
2. Create a new **project**. Neon creates a default database (`neondb`) automatically.
3. Select your project → **Connection Details** panel.

## 2. Get connection strings

Neon provides two types of connection strings:

| Type | Purpose | `.env` key |
|------|---------|-----------|
| **Pooled** (Transaction mode) | App runtime queries | `DATABASE_URL` |
| **Direct** (Unpooled) | Drizzle migrations | `DATABASE_URL_UNPOOLED` |

In the Neon console → Connection Details:
- Copy the **Connection string** (pooled) → `DATABASE_URL`
- Toggle to **Unpooled** → copy → `DATABASE_URL_UNPOOLED`

Both look like:
```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## 3. Run migrations

```bash
# Generate SQL files from the Drizzle schema (src/db/schema.ts)
npm run db:generate

# Apply migrations to your Neon database
npm run db:migrate
```

This creates all Better-Auth tables (`user`, `session`, `account`, `verification`,
`rate_limit`) plus the internal rate-limit table (`rate_limits`) and the example
`examples` table.

## 4. Better-Auth secret

Generate a random secret (≥32 chars):
```bash
openssl rand -base64 32
```
Set it as `BETTER_AUTH_SECRET`.

## 5. OAuth apps

See `docs/OAUTH.md` for GitHub and Google OAuth setup.

Callback URLs:
```
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/google
```

## 6. Verify

```bash
npm install
cp .env.example .env   # fill in all values
npm run db:migrate
npm run dev
```

Open `/login`, sign in, land on `/dashboard`.

## Free tier notes

- **Neon free**: 1 project, 0.5 GB storage, 190 compute hours/month
- Compute scales to zero when idle — cold starts add ~1 s latency
- Free tier does **not** expire (as of Neon's current pricing)
- No credit card required

> **Unverified**: Exact compute-hour limits and cold-start behaviour may change.
> Check <https://neon.tech/pricing> for current limits.
