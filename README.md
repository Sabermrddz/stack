

A multi-stack Next.js scaffolder. One command, three stacks, all free.

```bash
npx github:Sabermrddz/stack my-app --stack=mongo
npx github:Sabermrddz/stack my-app --stack=postgres
npx github:Sabermrddz/stack my-app --stack=appwrite
```

If `--stack` is omitted, the CLI asks interactively.

> **Note:** This scaffolder runs directly from GitHub. No npm installation required!

## Stacks

| Stack | Auth | Database | Storage |
|-------|------|----------|---------|
| `mongo` | Better-Auth (email + Google + GitHub) | MongoDB Atlas M0 (Mongoose) | Backblaze B2 |
| `postgres` | Better-Auth + Drizzle adapter | Neon (PostgreSQL) + Drizzle ORM | Backblaze B2 |
| `appwrite` | Appwrite Cloud Auth | Appwrite TablesDB | Appwrite Storage |

## Common to all stacks

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + ESLint
- Zod env validation (`@t3-oss/env-nextjs`)
- Cloudflare Turnstile on all public auth forms
- Internal rate limiter (no external service) — per-stack adapter

## Requirements

- Node.js ≥ 20.9.0

## Generated project structure

```
my-app/
  src/
    app/          Next.js App Router pages + API routes
    lib/          Stack-specific helpers (auth, db, storage)
    components/   Shared React components
    db/           Drizzle schema (postgres only)
    models/       Mongoose models (mongo only)
    env.ts        Zod env schema (stack-specific)
    proxy.ts      Next.js middleware
  docs/           Setup guides for each service
  .env.example    All required env vars
  drizzle.config.ts  (postgres only)
```

## License

MIT
