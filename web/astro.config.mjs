// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Cloudflare Pages exposes CF_PAGES_URL at build time (production URL on `main`,
 * the preview URL on `dev`). PUBLIC_SITE_URL overrides it (e.g. a custom domain).
 */
const site = process.env.PUBLIC_SITE_URL || process.env.CF_PAGES_URL || undefined;

export default defineConfig({
  site,
  // Fully static for now. When server endpoints are needed (e.g. /api/checkout
  // for Stripe), install @astrojs/cloudflare and add:
  //   adapter: cloudflare(),
  // then mark only the dynamic routes with `export const prerender = false`.
  // Everything else keeps prerendering, so no page restructuring is needed.
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  devToolbar: { enabled: false },
});
