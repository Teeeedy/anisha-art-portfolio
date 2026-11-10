import type { SanityImage } from '../types/sanity';
import { urlFor } from './sanity';

export interface ResponsiveImage {
  src: string;
  srcset: string;
  /** Intrinsic size of the largest candidate — prevents layout shift. */
  width: number;
  height: number;
  alt: string;
  /** Tiny base64 preview from Sanity, if available. */
  lqip?: string;
}

export interface ResponsiveImageOptions {
  /** Candidate widths for srcset. */
  widths?: number[];
  /** width / height. When set the image is cropped (respecting hotspot). Otherwise uncropped. */
  aspectRatio?: number;
  quality?: number;
}

/** Square grid tiles: 2 cols on mobile, 4 on desktop. */
export const GRID_WIDTHS = [320, 480, 640, 800, 1000];
export const GRID_SIZES = '(min-width: 768px) 25vw, 50vw';

/** Large single images (hero, product main image, portrait). */
export const LARGE_WIDTHS = [480, 768, 1024, 1440, 1920, 2400];

export function hasAsset(image: SanityImage | null | undefined): image is SanityImage & {
  asset: NonNullable<SanityImage['asset']>;
} {
  return Boolean(image && image.asset && image.asset._id);
}

/**
 * Builds src/srcset for a Sanity image. Returns null when there is no asset so
 * callers can render a placeholder instead.
 */
export function responsiveImage(
  image: SanityImage | null | undefined,
  options: ResponsiveImageOptions = {},
): ResponsiveImage | null {
  if (!hasAsset(image)) return null;

  const { widths = LARGE_WIDTHS, aspectRatio, quality = 80 } = options;
  const sourceWidth = image.asset.metadata?.dimensions?.width;
  const sourceAspect = image.asset.metadata?.dimensions?.aspectRatio;

  // Do not ask the CDN for upscaled candidates.
  const candidates = widths.filter((w, i) => !sourceWidth || w <= sourceWidth || i === 0);
  const largest = candidates[candidates.length - 1] ?? widths[0] ?? 800;

  const heightFor = (w: number) =>
    aspectRatio ? Math.round(w / aspectRatio) : sourceAspect ? Math.round(w / sourceAspect) : 0;

  const build = (w: number) => {
    let b = urlFor(image).width(w).quality(quality);
    b = aspectRatio ? b.height(heightFor(w)).fit('crop') : b.fit('max');
    return b.url();
  };

  const srcset = candidates.map((w) => `${build(w)} ${w}w`).join(', ');

  return {
    src: build(largest),
    srcset,
    width: largest,
    height: heightFor(largest) || Math.round(largest * 0.75),
    alt: image.alt?.trim() ?? '',
    lqip: image.asset.metadata?.lqip,
  };
}

/** Square crop for grid tiles (hotspot-aware). */
export function tileImage(image: SanityImage | null | undefined): ResponsiveImage | null {
  return responsiveImage(image, { widths: GRID_WIDTHS, aspectRatio: 1 });
}
