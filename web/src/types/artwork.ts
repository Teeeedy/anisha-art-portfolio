import type { PortableText, SanityImage } from './sanity';

/** Mirrors studio/schemaTypes/artwork.ts → status. */
export type ArtworkStatus = 'available' | 'sold' | 'reserved' | 'not-for-sale';

/** Mirrors studio/schemaTypes/artwork.ts → productType. */
export type ProductType = 'original' | 'print' | 'digital';

/** A purchasable variation (e.g. "A3 print"). Mirrors studio/schemaTypes/variant.ts. */
export interface Variant {
  _key: string;
  name: string;
  sku: string;
  /** Integer, smallest currency unit (cents). */
  price: number;
  quantity?: number | null;
}

/** Commerce fields shared by cart / checkout code later. All optional in the CMS. */
export interface ArtworkCommerce {
  status?: ArtworkStatus | null;
  /** Integer, smallest currency unit (cents). */
  price?: number | null;
  /** ISO 4217, defaults to "AUD" in the Studio. */
  currency?: string | null;
  sku?: string | null;
  productType?: ProductType | null;
  quantity?: number | null;
  variants?: Variant[] | null;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  requiresShipping?: boolean | null;
  weightGrams?: number | null;
  packedDimensions?: string | null;
}

export interface Artwork extends ArtworkCommerce {
  _id: string;
  title: string;
  slug: string;
  images: SanityImage[];
  medium?: string | null;
  size?: string | null;
  year?: number | null;
  description?: PortableText | null;
  featured?: boolean | null;
  sortOrder?: number | null;
}

/** What the grid needs — the list query omits the description. */
export type ArtworkSummary = Omit<Artwork, 'description'>;

/** Resolved status: the CMS default is "available" when the field was never set. */
export function artworkStatus(artwork: Pick<ArtworkCommerce, 'status'>): ArtworkStatus {
  return artwork.status ?? 'available';
}
