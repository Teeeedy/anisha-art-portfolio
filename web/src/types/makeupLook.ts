import type { SanityFileAsset, SanityImage } from './sanity';

export interface MakeupLook {
  _id: string;
  title: string;
  caption?: string | null;
  image?: SanityImage | null;
  /** Resolved file asset (video.asset->), or null when the look is image-only. */
  video?: SanityFileAsset | null;
  sortOrder?: number | null;
}
