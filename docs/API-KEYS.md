# API keys (manual)

Each service below needs an account and a key. Put every value in `.env`
(never in git) — see `.env.example` for the key names.

## MongoDB (database)

`MONGODB_URI`

1. <https://www.mongodb.com/atlas> → create a free **M0** cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add IP address `0.0.0.0/0` (allow all) for local
   development, or your current IP.
4. **Clusters → Connect → Drivers** → copy the connection string and fill in
   your username, password and database name:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority
   ```

## Arcjet (rate limit + bot detection)

`ARCJET_KEY`

1. <https://app.arcjet.com> → sign in → **Create project**.
2. Pick the **free** plan.
3. **Settings → API keys** → copy the **key** starting with `ajk_`.
4. Paste it into `.env`.

Notes:

- Arcjet fails **open**: if the key is missing/invalid or Arcjet is down,
  requests are allowed rather than blocked (check the logs for `ERROR`
  decisions).
- Rules are defined in `src/lib/arcjet.ts` (Shield + bot detection + rate
  limit). Use `mode: "DRY_RUN"` while tuning so nothing gets blocked.

## Cloudflare Turnstile (captcha)

See `docs/CLOUDFLARE.md` — keys are `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
`TURNSTILE_SECRET_KEY`.

## Backblaze B2 (file uploads)

See `docs/BACKBLAZE.md` — required when you enable file uploads.
