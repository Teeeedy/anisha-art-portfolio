import type { SanityFileAsset, SanityImage } from './sanity';

export interface SiteSettings {
  siteTitle?: string | null;
  heroImage?: SanityImage | null;
  heroVideo?: SanityFileAsset | null;
  email?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  seoDescription?: string | null;
}
