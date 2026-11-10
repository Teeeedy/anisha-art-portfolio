import type { PortableText, SanityImage } from './sanity';

export interface AboutPage {
  portrait?: SanityImage | null;
  bio?: PortableText | null;
  youtubeUrl?: string | null;
}
