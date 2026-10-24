# OAuth apps (manual)

Better-Auth needs a client ID and secret from GitHub and Google.
Create both, then put the values in `.env` — never in git.

> **Appwrite stack**: Skip this guide. Configure OAuth directly in the Appwrite
> console (Project → Auth → Settings). See `docs/APPWRITE.md`.

Callback URLs for Better-Auth (local development):
```
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/google
```
For production replace with your real domain.

## GitHub

1. Go to <https://github.com/settings/developers> → **New OAuth App**.
2. **Application name**: e.g. `my-app (dev)`.
3. **Homepage URL**: `http://localhost:3000`.
4. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`.
5. Create the app → copy the **Client ID** into `GITHUB_CLIENT_ID`.
6. **Generate a new client secret** → copy it into `GITHUB_CLIENT_SECRET`.

> For production, create a second OAuth app with your production URLs.

## Google

1. Go to <https://console.cloud.google.com/> → create a project.
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - Fill in app name, support email, scopes: `email`, `profile`, `openid`.
   - Add yourself under **Test users** while in testing mode.
3. **Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized redirect URIs** → `http://localhost:3000/api/auth/callback/google`.
4. Copy **Client ID** → `GOOGLE_CLIENT_ID` and **Client secret** → `GOOGLE_CLIENT_SECRET`.

> Google allows one redirect URI set per client. Create a separate Web client for production.

## Verify

1. Fill both pairs of keys in `.env`.
2. `npm run dev` → open `/login` → click **Sign in with Google** (or GitHub).
3. After approving, you should land on `/dashboard` signed in.
