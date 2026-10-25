# Appwrite setup (manual)

This guide covers the **appwrite** stack: Appwrite Cloud for auth, TablesDB, and Storage.
No secrets belong in git — put values in `.env`.

## 1. Create an Appwrite Cloud account

1. Go to <https://cloud.appwrite.io> → **Sign up** (free, no credit card required).
2. Create a new **Organization** and a **Project**.
3. Note your **Project ID** from the project settings — this is `NEXT_PUBLIC_APPWRITE_PROJECT`.
4. The Appwrite Cloud endpoint is always `https://cloud.appwrite.io/v1`.

## 2. Create an API key

1. Project → **Settings → API Keys → Create API Key**.
2. Give it a name (e.g. `my-app-server`).
3. Scopes needed:
   - `sessions.write` — create/delete sessions
   - `users.read`, `users.write` — manage accounts
   - `databases.read`, `databases.write` — TablesDB access
   - `files.read`, `files.write` — Storage access
4. Copy the key → `APPWRITE_API_KEY`.

## 3. Create an Auth platform

1. Project → **Overview → Add Platform → Web App**.
2. **Name**: e.g. `my-app`.
3. **Hostname**: `localhost` for dev, your production domain for prod.
4. This allows the Appwrite JS SDK (used in the browser) to make auth requests.

## 4. Configure OAuth (optional)

1. Project → **Auth → Settings**.
2. Enable **GitHub** and/or **Google** providers.
3. For GitHub: create an OAuth app at <https://github.com/settings/developers>.
   Callback URL: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/<PROJECT_ID>`
4. For Google: create OAuth credentials at <https://console.cloud.google.com>.
   Callback URL: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/<PROJECT_ID>`

## 5. Create a TablesDB database

1. Project → **Databases → Create Database**.
2. Give it a name (e.g. `main`) — note the **Database ID** → `APPWRITE_DATABASE_ID`.
3. Create a **Table** inside it for rate limiting:
   - **Table ID**: `rate_limits`
   - **Columns**:
     | Column | Type    | Required | Default |
     |--------|---------|----------|---------|
     | `rl_key`  | String  | Yes      | —       |
     | `count`   | Integer | Yes      | 0       |
     | `expires_at` | Integer | Yes   | —       |
   - **Permissions**: leave default (API key has full access)

## 6. Create a Storage bucket

1. Project → **Storage → Create Bucket**.
2. **Name**: e.g. `uploads` — note the **Bucket ID** → `APPWRITE_BUCKET_ID`.
3. **Permissions**: add `users` role with `create` and `read` permissions (or restrict as needed).
4. **Max File Size**: 5242880 (5 MB) — matches the app's validation.
5. **Allowed File Extensions**: `jpg`, `jpeg`, `png`, `webp`, `gif`, `pdf`.

## 7. Environment variables

Fill in `.env`:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=<your-project-id>
APPWRITE_API_KEY=<your-api-key>
APPWRITE_DATABASE_ID=<your-database-id>
APPWRITE_BUCKET_ID=<your-bucket-id>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<from-cloudflare>
TURNSTILE_SECRET_KEY=<from-cloudflare>
```

## 8. Verify

```bash
npm install
cp .env.example .env   # fill in all values
npm run dev
```

Open `/login`, sign up / sign in, land on `/dashboard`, try an upload.

## Free tier notes

- **Appwrite Cloud Free**: 75,000 monthly active users, 2 GB storage,
  5 GB bandwidth/month, 1 TablesDB database and 1 Storage bucket per project
- Projects are **paused after 1 week of inactivity** — re-activate in the console
- No credit card required

> The exact monthly active user counting rules and any separate TablesDB row
> or compute quotas were not verified. Check <https://appwrite.io/pricing> for
> current limits.

## Session cookie details

The app uses an HTTP-only cookie named `a_session_<project-id>`. The sign-in
server action stores the session secret and expiration in this cookie. The
proxy checks that cookie as an early route guard; server components and server
actions read it through `createSessionClient()`, which calls `setSession()` on
a per-request Appwrite client before making user-scoped API calls.
