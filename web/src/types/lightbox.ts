/** Serialised into the page for the Lightbox script. Keep it JSON-safe. */
export interface LightboxItem {
  type: 'image' | 'video';
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt: string;
  title?: string;
  caption?: string;
  /** Video only */
  poster?: string;
  mimeType?: string;
}
