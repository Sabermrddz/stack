# OAuth apps (manual)

Better-Auth needs a client ID and secret from GitHub and Google. Create both,
then put the values in `.env` — never in git.

Callback URL for both providers (local development):

```
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/google
```

For production, use your real domain: `https://yourdomain.com/api/auth/callback/<provider>`.

## GitHub

1. Go to <https://github.com/settings/developers> → **New OAuth App**.
2. **Application name**: e.g. `my-app (dev)`.
3. **Homepage URL**: `http://localhost:3000`.
4. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`.
5. Create the app → copy the **Client ID** into `GITHUB_CLIENT_ID`.
6. **Generate a new client secret** → copy it into `GITHUB_CLIENT_SECRET`.

> For a second (production) app, repeat with your production URLs.

## Google

1. Go to <https://console.cloud.google.com/> → create a project (or pick one).
2. **APIs & Services → OAuth consent screen**:
   - User type: **External** (unless you only sign in with Workspace accounts).
   - Fill in app name, support email, scopes: `email`, `profile`, `openid`.
   - Add yourself under **Test users** while the app is in testing mode.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: e.g. `my-app (dev)`.
   - **Authorized redirect URIs** → Add:
     `http://localhost:3000/api/auth/callback/google`
4. Copy the **Client ID** into `GOOGLE_CLIENT_ID` and **Client secret** into
   `GOOGLE_CLIENT_SECRET`.

> Google only allows one redirect URI set per client. Create a second Web
> client for production with `https://yourdomain.com/api/auth/callback/google`,
> or edit the URI later.

## Verify

1. Fill both pairs of keys in `.env`.
2. `npm run dev` → open `/login` → click **Sign in with Google** (or GitHub).
3. After approving, you should land on `/dashboard` signed in.
