# Cloudflare setup (manual)

These steps must be done by hand in the Cloudflare dashboard. Nothing here is
automated, and no secrets belong in git — put the values in `.env`.

## 1. Add your domain (free plan)

1. Create a Cloudflare account at <https://dash.cloudflare.com>.
2. **Add a site** → enter your domain (e.g. `example.com`) → choose the **Free** plan.
3. Cloudflare shows your domain's current DNS records. Review them, then continue.
4. At the end, Cloudflare gives you **two nameservers**. Replace your domain's
   nameservers at your registrar with those two.
5. Wait for the nameserver change to activate (minutes to 48 h). Status must show
   **Active** in the Cloudflare dashboard.

## 2. Enable the proxy (orange cloud)

1. Cloudflare dashboard → your site → **DNS**.
2. For the `A`/`AAAA`/`CNAME` record pointing at your app, toggle **Proxy status**
   to **Proxied** (orange cloud). Grey cloud = DNS only, no protection.

## 3. Managed Challenge / Under Attack Mode

1. Cloudflare dashboard → your site → **Security → Settings**.
2. **Security Level** → set to **Managed Challenge** for a good balance.
3. Optional: enable **Bot Fight Mode** and **Browser Integrity Check**.

## 4. Create a Turnstile site

Turnstile is Cloudflare's CAPTCHA alternative — invisible for real users.

1. Cloudflare dashboard → **Turnstile** (left sidebar) → **Add site**.
2. **Site name**: anything, e.g. `my-app local`.
3. **Domain**: add `localhost` for local development, plus your production domain.
4. **Widget mode**: **Managed** (recommended).
5. Create the site. Cloudflare shows two values:

   | Cloudflare value      | `.env` key                       |
   | --------------------- | -------------------------------- |
   | Site key              | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` |
   | Secret key            | `TURNSTILE_SECRET_KEY`           |

6. Copy them into `.env` (never commit `.env` — only `.env.example` is tracked).

## 5. Verify

- `npm run dev`, open `/login`, the Turnstile widget should render.
- Submitting the form without completing the challenge must fail with
  *"Captcha verification failed. Please complete the challenge."*

## Notes

- Turnstile is **always free** with no request limits.
- The Cloudflare free plan is permanent — no credit card required.
