# Free-tier service limits

A reference for the services used in each stack. All are free with no
time limit unless noted. Check the linked pricing pages for current limits
before going to production — limits change.

## Cloudflare (all stacks)

| Service   | Limit | Notes |
|-----------|-------|-------|
| Turnstile | Unlimited | Always free, no API calls counted |
| Free plan | 1 site | Shared SSL, basic DDoS, 3 Page Rules |

Reference: <https://www.cloudflare.com/plans/>

---

## Mongo stack

### MongoDB Atlas M0

| Resource  | Limit |
|-----------|-------|
| Storage   | 512 MB shared |
| Connections | 500 |
| RAM       | 512 MB shared |
| Regions   | AWS, GCP, Azure (1 cluster) |

- **No time limit** — M0 is permanently free.
- Backups disabled on M0. Export data periodically if needed.
- Reference: <https://www.mongodb.com/pricing>

### Backblaze B2

| Resource        | Limit |
|-----------------|-------|
| Storage         | 10 GB/month free |
| Download (CDN)  | 1 GB/day free |
| Class A/B ops   | 2,500/2,500 free per day |

- Pay-as-you-go above the free threshold ($0.006/GB storage).
- Free egress to Cloudflare partners (CDN routing via Cloudflare).
- Reference: <https://www.backblaze.com/b2/b2-pricing.html>

---

## Postgres stack

### Neon (PostgreSQL)

| Resource        | Limit |
|-----------------|-------|
| Projects        | 1 |
| Storage         | 0.5 GB |
| Compute hours   | 190/month |
| Branches        | 10 |

- Compute scales to zero when idle (cold-start ~1 s).
- **No time limit** — free tier does not expire.
- Reference: <https://neon.tech/pricing>

> **Unverified**: The exact compute-hours ceiling and whether the 190 h/month
> limit resets per calendar month or rolling 30 days could not be confirmed from
> docs at build time. Verify at the link above.

### Backblaze B2 — same as mongo stack above.

---

## Appwrite stack

### Appwrite Cloud (free tier)

| Resource        | Limit |
|-----------------|-------|
| Monthly active users | 75,000 |
| Storage         | 2 GB |
| Bandwidth       | 5 GB/month |
| Executions (Functions) | 750,000 |
| Databases       | Unlimited |
| Projects        | Unlimited |

- Projects **paused after 1 week of inactivity** — re-activate in the console.
- No credit card required.
- Reference: <https://appwrite.io/pricing>

> **Unverified**: The exact definition of "monthly active user" (MAU) in Appwrite's
> billing and whether TablesDB write operations count separately could not be
> confirmed. Verify at the link above before high-traffic deployment.

---

## Internal rate limiter (all stacks)

The rate limiter is fully in-process — no external service, no billing.

| Stack    | Storage backend | Cleanup |
|----------|-----------------|---------|
| mongo    | `rate_limits` collection | MongoDB TTL index (automatic) |
| postgres | `rate_limits` table | Lazy delete per-key on each request |
| appwrite | `rate_limits` TablesDB table | Lazy delete per-key on each request |

Better-Auth's built-in rate limiter (for `/sign-in/email`, `/sign-up/email`,
`/forget-password`) uses the same primary database adapter — no separate store.
