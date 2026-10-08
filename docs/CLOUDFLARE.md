# Cloudflare setup (manual)

These steps must be done by hand in the Cloudflare dashboard. Nothing here is
automated, and no secrets belong in git — put the values in `.env`.

## 1. Add your domain (free plan)

1. Create a Cloudflare account at <https://dash.cloudflare.com>.
2. **Add a site** → enter your domain (e.g. `example.com`) → choose the **Free** plan.
3. Cloudflare shows your domain's current DNS records. Review them, then continue.
4. At the end, Cloudflare gives you **two nameservers**. Replace your domain's
   nameservers at your registrar (where you bought the domain) with those two.
5. Wait for the nameserver change to activate (minutes to 48h). Status must show
   **Active** in the Cloudflare dashboard.

## 2. Enable the proxy (orange cloud)

The proxy is what makes Cloudflare sit in front of your app and is **required**
for `CF-Connecting-IP` (used by Arcjet to see the real visitor IP) and for the
security features below.

1. Cloudflare dashboard → your site → **DNS**.
2. For the `A`/`AAAA`/`CNAME` record pointing at your app, toggle **Proxy status**
   to **Proxied** (orange cloud). Grey cloud = DNS only, no protection.
3. Your app must receive traffic on the domain Cloudflare proxies. Point the
   record at your host (VPS, Node server, etc.) and make sure the origin only
   accepts traffic from Cloudflare if you want to lock it down fully.

## 3. Managed Challenge / Under Attack Mode

1. Cloudflare dashboard → your site → **Security → Settings** (or **Security →
   WAF**, depending on dashboard version).
2. **Security Level** (or **Challenge Passage**) → set to **Managed Challenge**
   for a good balance, or use **Under Attack Mode** when you are being attacked
   (it challenges every visitor with a JS challenge).
3. Optional hardening on the same page: enable **Bot Fight Mode** and **Browser
   Integrity Check**.

These challenge every visitor at the edge, before the request ever reaches your
Next.js app. Arcjet and Turnstile still run inside the app as a second layer.

## 4. Create a Turnstile site

Turnstile is Cloudflare's CAPTCHA alternative — invisible for real users.

1. Cloudflare dashboard → **Turnstile** (left sidebar) → **Add site**.
2. **Site name**: anything, e.g. `my-app local`.
3. **Domain**: add `localhost` for local development, plus your production domain.
4. **Widget mode**: **Managed** (recommended) — invisible when possible,
   challenges only suspicious visitors.
5. Create the site. Cloudflare shows two values:

   | Cloudflare value      | `.env` key                       |
   | --------------------- | -------------------------------- |
   | Site key              | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` |
   | Secret key            | `TURNSTILE_SECRET_KEY`           |

6. Copy them into `.env` (never commit `.env` — only `.env.example` is tracked).
7. You can add/rename domains later from the site's settings.

## 5. Verify

- `npm run dev`, open `/login`, the Turnstile widget should render (a checkbox
  or an invisible tick) above the "Sign in with email" button.
- Submitting the email form without completing the challenge must fail with
  *"Captcha verification failed. Please complete the challenge."*

## Related

- `docs/API-KEYS.md` — Arcjet key and MongoDB connection string.
- `docs/OAUTH.md` — GitHub/Google OAuth apps.
