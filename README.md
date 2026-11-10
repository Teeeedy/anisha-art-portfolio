# Blends by A

Art + make up portfolio for Anisha. npm-workspaces monorepo:

| Folder    | What                                   | Stack                                   |
| --------- | -------------------------------------- | --------------------------------------- |
| `studio/` | Content studio (editors publish here)  | Sanity Studio (`defineConfig` API)       |
| `web/`    | Public website                         | Astro (static), plain CSS, TypeScript   |

Content flows Sanity → Astro at build time. The site is fully static and hosted on
Cloudflare Pages. Commerce (Stripe) is designed for but not built yet — see
[Adding Stripe later](#adding-stripe-later).

---

## Local development

Requirements: Node ≥ 22.12 (see `.nvmrc`), npm ≥ 9.

```bash
npm install                # installs both workspaces from the repo root
```

### Studio (`/studio`)

```bash
cp studio/.env.example studio/.env   # set SANITY_STUDIO_PROJECT_ID
npm run dev:studio                    # http://localhost:3333
```

The Studio exposes two **workspaces**, one per dataset:

- `http://localhost:3333/production` → `production` dataset (live site, `main`)
- `http://localhost:3333/development` → `development` dataset (`dev` branch / preview)

First-time project setup:

```bash
cd studio
npx sanity login
npx sanity init --env            # or create the project at sanity.io/manage
npx sanity dataset create production
npx sanity dataset create development
```

Add `http://localhost:3333`, your deployed Studio URL and both site URLs to
**CORS origins** in sanity.io/manage → API (the website only needs read access
to public datasets, so no token is required).

Deploy the hosted Studio:

```bash
npm run deploy:studio            # → https://blends-by-a.sanity.studio
```

Project id `il16wbqt`. The hosted Studio lives at
<https://blends-by-a.sanity.studio> (`/production` and `/development` workspaces).

### Web (`/web`)

```bash
cp web/.env.example web/.env     # fill in the values below
npm run dev                      # http://localhost:4321
npm run check                    # astro check (types)
npm run build                    # static build → web/dist
```

| Variable                   | Purpose                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `PUBLIC_SANITY_PROJECT_ID` | Sanity project id                                                  |
| `PUBLIC_SANITY_DATASET`    | `development` locally and on the dev preview, `production` on main |
| `PUBLIC_FORMSPREE_ENDPOINT`| Formspree form URL used by the enquiry + contact forms             |
| `PUBLIC_ENABLE_COMMERCE`   | `false` (default) shows enquiry forms; `true` shows the Buy button |
| `PUBLIC_SITE_URL`          | Optional canonical URL (custom domain). Falls back to `CF_PAGES_URL` |

Without `PUBLIC_SANITY_PROJECT_ID` the site still builds, with every page in its
empty state — handy for CI and first clones.

---

## Branch workflow

Two long-lived branches:

- `dev` — day-to-day work and staging. Deploys to the Cloudflare Pages **preview**
  URL and reads the `development` dataset.
- `main` — production. Deploys to the production URL and reads `production`.

Flow: branch from `dev` (or commit directly to `dev` for small changes) → open a
PR `dev → main` → merge when the preview looks right. Never commit `.env` files;
update `.env.example` when you add a variable.

---

## Cloudflare Pages setup

Create a Pages project connected to this repository with:

| Setting                 | Value           |
| ----------------------- | --------------- |
| Production branch       | `main`          |
| Root directory          | `web`           |
| Build command           | `npm run build` |
| Build output directory  | `dist`          |

`web/wrangler.jsonc` records the output dir and compatibility date. Preview
deployments are automatic for every non-production branch, so `dev` gets its own
`https://dev.<project>.pages.dev` URL.

### Environment variables (Settings → Environment variables)

Set these for **Production** and **Preview** separately:

| Variable                    | Production                | Preview                   |
| --------------------------- | ------------------------- | ------------------------- |
| `PUBLIC_SANITY_PROJECT_ID`  | `<project id>`            | `<project id>`            |
| `PUBLIC_SANITY_DATASET`     | `production`              | `development`             |
| `PUBLIC_FORMSPREE_ENDPOINT` | `https://formspree.io/f/…`| `https://formspree.io/f/…`|
| `PUBLIC_ENABLE_COMMERCE`    | `false`                   | `false` (or `true` to test)|
| `NODE_VERSION`              | `22`                      | `22`                      |

> Because the install runs from the `web` root directory, Cloudflare uses the
> workspace's own `package.json`. If the build ever needs the root lockfile, set
> the root directory to `/` and the build command to
> `npm ci && npm run build --workspace web` with output `web/dist`.

### Rebuild when content is published

The site is static, so publishing in Sanity must trigger a new build:

1. **Cloudflare**: Pages project → Settings → Builds & deployments → *Deploy hooks*.
   Create two hooks: `sanity-production` (branch `main`) and `sanity-development`
   (branch `dev`). Each gives you a URL.
2. **Sanity**: sanity.io/manage → project → API → *Webhooks* → Create.
   - Name: `Rebuild production`, URL: the `main` deploy hook, Dataset: `production`,
     Trigger on: create, update, delete, Filter: leave empty (or
     `_type in ["artwork","makeupLook","about","siteSettings"]`), HTTP method: POST.
   - Repeat for `development` → the `dev` deploy hook.

Publishing now rebuilds the matching environment within a minute or two.

---

## Content model (Studio)

- **artwork** — title, slug, images (hotspot + required alt), medium, size, year,
  description, featured, sortOrder. A **Commerce** tab holds the optional
  status / price (integer cents) / currency / SKU (unique) / productType /
  quantity / variants / Stripe ids / shipping fields.
- **makeupLook** — title, image and/or video (at least one), caption, sortOrder.
- **about** (singleton) — portrait, bio, optional YouTube URL.
- **siteSettings** (singleton) — site title, hero image/video, email, socials,
  SEO description.

Singletons appear as single documents in the desk; they cannot be created or
deleted from the Studio.

## Frontend map (`web/src`)

```
lib/sanity.ts        client (CDN, pinned apiVersion) + urlFor + sanityFetch
lib/queries.ts       all GROQ, including commerce fields
lib/price.ts         formatPrice(amountInCents, currency) — the only formatter
lib/flags.ts         commerceEnabled / isCommerceEnabled()
lib/image.ts         srcset helpers (hotspot-aware square crops for the grid)
types/               Artwork, Variant, MakeupLook, SiteSettings, BuyButtonProps…
components/          Header, Footer, Hero, Grid, GridTile, Lightbox, PriceTag,
                     ProductActions, BuyButton (stub), EnquiryForm, ContactForm
scripts/             the only client JS: forms, lightbox, hover video, thumbnails
pages/               /, /art, /art/[slug], /makeup, /about, /contact, 404
```

Product elements carry `data-artwork-id`, `data-sku`, `data-price`,
`data-currency` and `data-status` so analytics or a cart script can hook in
without template changes.

---

## Adding Stripe later

Everything below is additive; nothing needs restructuring.

1. **Adapter.** `npm i @astrojs/cloudflare -w web`, then in `web/astro.config.mjs`
   add `adapter: cloudflare()`. Keep `output: 'static'`; only the API routes opt
   out of prerendering. The Pages project needs `compatibility_flags: ["nodejs_compat"]`
   (already in `wrangler.jsonc`).
2. **Checkout endpoint.** `web/src/pages/api/checkout.ts` with
   `export const prerender = false`. It receives `{ artworkId, sku, variantSku?, quantity }`
   (see `types/commerce.ts` → `CheckoutLineItem`), re-reads the artwork from Sanity
   server-side (never trust the client price), creates a Stripe Checkout Session
   with `price_data` from `price`/`currency` (already integer cents), and returns
   the session URL. Secrets (`STRIPE_SECRET_KEY`) go in Cloudflare env vars, not
   `PUBLIC_*`.
3. **Webhook.** `web/src/pages/api/stripe-webhook.ts` (also `prerender = false`)
   verifies the signature with `STRIPE_WEBHOOK_SECRET`, and on
   `checkout.session.completed` patches the artwork in Sanity
   (`status: "sold"`, decrement `quantity`, or decrement the matching variant) using
   a write token (`SANITY_WRITE_TOKEN`), then calls the deploy hook so the site
   rebuilds with the new status.
4. **BuyButton.** Flip `PUBLIC_ENABLE_COMMERCE=true`, remove `disabled` in
   `components/BuyButton.astro` and add a small script that POSTs its data
   attributes to `/api/checkout` and redirects to the returned URL.
   `ProductActions` already switches between Buy / Enquire / status copy.
5. **Prices.** Keep storing integer cents in Sanity and keep `formatPrice()` as
   the single formatter. `stripeProductId` / `stripePriceId` fields exist on the
   schema for syncing products if you prefer Stripe-hosted prices over `price_data`.
