import type { ArtworkStatus } from './artwork';
import type { SanityImage } from './sanity';

/** One square tile in the shared Grid component (used by /art and /makeup). */
export interface GridItem {
  id: string;
  title: string;
  /** Link tile (art). Mutually exclusive with `lightboxIndex`. */
  href?: string;
  /** Lightbox tile (make up): index into the Lightbox items. */
  lightboxIndex?: number;
  image?: SanityImage | null;
  /** Direct URL to a video file; tile plays muted on hover. */
  videoUrl?: string | null;
  /** Commerce fields for the hover PriceTag + data attributes. */
  price?: number | null;
  currency?: string | null;
  status?: ArtworkStatus | null;
  sku?: string | null;
}
