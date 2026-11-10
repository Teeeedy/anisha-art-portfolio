// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Cloudflare Pages exposes CF_PAGES_URL at build time (production URL on `main`,
 * the preview URL on `dev`). PUBLIC_SITE_URL overrides it (e.g. a custom domain).
 */
const site = process.env.PUBLIC_SITE_URL || process.env.CF_PAGES_URL || undefined;

// Build-time diagnostics: names only (never values) of the variables the build can see.
const visible = Object.keys(process.env)
  .filter((k) => k.startsWith('PUBLIC_') || k.startsWith('CF_PAGES'))
  .sort();
console.log(`[env] visible at build: ${visible.length ? visible.join(', ') : '(none)'}`);

// On Cloudflare, a missing project id means the variables were not injected.
// Fail the build rather than publish an empty site over the live one.
if (process.env.CF_PAGES && !process.env.PUBLIC_SANITY_PROJECT_ID) {
  throw new Error(
    'PUBLIC_SANITY_PROJECT_ID is not available to this Cloudflare Pages build. ' +
      'Check Settings → Variables and secrets for this environment (Production / Preview).',
  );
}

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
