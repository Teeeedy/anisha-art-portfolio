/** Shapes of Sanity primitives as returned by the GROQ projections in lib/queries.ts. */

export interface SanityImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface SanityImageAsset {
  _id: string;
  url?: string;
  metadata?: {
    lqip?: string;
    dimensions?: SanityImageDimensions;
  };
}

export interface SanityHotspot {
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface SanityCrop {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SanityImage {
  _key?: string;
  _type?: 'image';
  alt?: string | null;
  asset?: SanityImageAsset | null;
  hotspot?: SanityHotspot | null;
  crop?: SanityCrop | null;
}

export interface SanityFileAsset {
  _id: string;
  url: string;
  mimeType?: string;
  size?: number;
  originalFilename?: string;
}

/* ---- Portable Text (minimal) -------------------------------------------- */

export interface PortableTextSpan {
  _type: 'span';
  _key?: string;
  text: string;
  marks?: string[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: string;
  href?: string;
  blank?: boolean;
  [key: string]: unknown;
}

export interface PortableTextBlock {
  _type: 'block';
  _key?: string;
  style?: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote' | string;
  listItem?: 'bullet' | 'number';
  level?: number;
  children: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
}

export type PortableText = PortableTextBlock[];
