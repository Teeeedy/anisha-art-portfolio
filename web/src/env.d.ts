/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  readonly PUBLIC_FORMSPREE_ENDPOINT?: string;
  /** "true" | "false" (string, as all env vars are). See lib/flags.ts. */
  readonly PUBLIC_ENABLE_COMMERCE?: string;
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
