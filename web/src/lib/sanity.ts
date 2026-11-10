import { createClient, type QueryParams, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '';
export const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
/** Pinned so query semantics never change under us. Bump deliberately. */
export const apiVersion = '2025-02-19';

export const isSanityConfigured = projectId.length > 0;

/**
 * Read-only client. Published content only, served from the CDN.
 * `null` when PUBLIC_SANITY_PROJECT_ID is missing so a fresh clone still builds
 * (every page renders its empty state instead).
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
    })
  : null;

let warned = false;

/**
 * Fetch wrapper used by every page. Returns `fallback` when the client is not
 * configured or the query returns null. Network / GROQ errors are NOT swallowed:
 * a broken build should fail loudly rather than deploy an empty site.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  fallback: T,
): Promise<T> {
  if (!client) {
    if (!warned) {
      warned = true;
      console.warn(
        '[sanity] PUBLIC_SANITY_PROJECT_ID is not set — building with empty content. ' +
          'Copy web/.env.example to web/.env to connect the CMS.',
      );
    }
    return fallback;
  }
  const result = await client.fetch<T | null>(query, params);
  return result ?? fallback;
}

const builder = createImageUrlBuilder(
  client ?? { projectId: projectId || 'unconfigured', dataset },
);

/** Image URL builder bound to the project. Chain .width().height().fit() … .url() */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format');
}
