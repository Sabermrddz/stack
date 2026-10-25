# Free-tier service limits

Limits below were checked against each provider's official pricing or product
documentation on 2026-10-24. Providers can change their plans; follow the linked
source for current terms before launch.

## Cloudflare Turnstile (all stacks)

| Free-plan limit | Value |
|---|---:|
| Widgets per account | Up to 20 |
| Hostnames per widget | Up to 10 |
| Challenges / verification requests | Unlimited |

Source: [Turnstile plans](https://developers.cloudflare.com/turnstile/plans/).

## Mongo stack

### MongoDB Atlas Free cluster (formerly M0)

| Limit | Value |
|---|---:|
| Data storage | 0.5 GB |
| Concurrent connections | Up to 500 |
| Databases per cluster | Up to 100 |
| Collections per cluster | Up to 500 |
| Data transfer | 10 GB in and 10 GB out per rolling 7-day period |
| Throughput | Up to 100 operations per second |

Atlas permits one Free cluster per project. Free clusters can automatically
pause after 30 days with no connections. Backups can be enabled; up to four
daily snapshots are retained when enabled. The current docs do not publish RAM
as a configurable Free-cluster allocation, so no RAM figure is claimed here.

Source: [Atlas Free cluster limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).

### Backblaze B2

| Limit | Value |
|---|---:|
| Storage | First 10 GB free |
| Egress | Free up to 3x average monthly stored data; partner egress may be unlimited |
| Class A, B, C API calls | Free |
| Class D API calls | First 2,500 per day free, then billed |

The project uses S3-compatible B2. Uploads have no data-transfer charge. Above
the included storage and egress limits, usage is billed. The old claim of 1 GB
free downloads per day and daily Class A/B quotas is not current.

Sources: [B2 pricing](https://www.backblaze.com/cloud-storage/pricing),
[transaction pricing](https://www.backblaze.com/cloud-storage/transaction-pricing).

## Postgres stack

### Neon Free

| Limit | Value |
|---|---:|
| Projects | 100 |
| Branches | 10 per project |
| Compute | 100 CU-hours per project per month |
| PostgreSQL storage | 1 GB per project, 20 GB total per account |
| Public network transfer | 5 GB per project |

Free plan has no time limit and scales to zero after five minutes inactive.
The former documentation's 1-project, 0.5-GB and 190-compute-hour values are
outdated.

Source: [Neon plans](https://neon.com/docs/introduction/plans).

### Backblaze B2

See the Mongo stack's [Backblaze B2 limits](#backblaze-b2).

## Appwrite stack

### Appwrite Cloud Free

| Limit | Value |
|---|---:|
| Projects | 2 per Free organization |
| TablesDB databases | 1 per project |
| Storage buckets | 1 per project |
| Monthly active users | 75,000 |
| Storage | 2 GB |
| Bandwidth | 5 GB per month |
| Function executions | 750,000 per month |
| Functions | 2 per project |

Free projects pause after one week of inactivity. The exact monthly active
user counting rules, and the separate row/compute quotas that may apply to
TablesDB, were not verified in the available official documentation. Review
the current plan comparison before relying on those limits.

Sources: [Appwrite pricing](https://appwrite.io/pricing),
[Free plan documentation](https://appwrite.io/docs/advanced/billing/free).

## Internal rate limiter

The scaffolder includes a database-backed internal rate limiter for additional
sensitive application endpoints. Better Auth routes use Better Auth's own
built-in rate limiter and its configured database storage.

| Stack | Internal limiter storage | Cleanup |
|---|---|---|
| mongo | `rate_limits` MongoDB collection | MongoDB TTL index |
| postgres | `rate_limits` PostgreSQL table | Lazy deletion per key |
| appwrite | `rate_limits` TablesDB table | Lazy deletion per key |
